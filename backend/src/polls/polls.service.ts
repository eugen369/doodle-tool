import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
import { PrismaService } from './prisma.service'
import { CreatePollDto, CreateUserSessionDto } from './dtos/create-poll.dto'
import { generatePollPDF, PdfLang } from '../common/pdf.generator'

@Injectable()
export class PollsService {
    constructor(private prisma: PrismaService) {}

    async createPoll(createPollDto: CreatePollDto) {
        if (!createPollDto.slots || createPollDto.slots.length === 0) {
            throw new BadRequestException('At least one slot is required')
        }

        const poll = await this.prisma.poll.create({
            data: {
                title: createPollDto.title,
                description: createPollDto.description,
                timezone: createPollDto.timezone || 'UTC',
                slots: {
                    create: createPollDto.slots.map(slot => ({
                        startsAt: new Date(slot.startsAt),
                        endsAt: slot.endsAt ? new Date(slot.endsAt) : null
                    }))
                }
            },
            include: {
                slots: true
            }
        })

        return {
            id: poll.id,
            title: poll.title,
            moderatorToken: poll.moderatorToken,
            timezone: poll.timezone,
            createdAt: poll.createdAt
        }
    }

    async getPoll(id: string) {
        const poll = await this.prisma.poll.findUnique({
            where: { id },
            include: {
                slots: {
                    orderBy: { startsAt: 'asc' },
                    include: {
                        _count: {
                            select: {
                                votes: {
                                    where: { status: 'yes' }
                                }
                            }
                        }
                    }
                }
            }
        })

        if (!poll) {
            throw new NotFoundException('Poll not found')
        }

        return poll
    }

    async getPollWithVotes(id: string) {
        const poll = await this.getPoll(id)

        // Stimmen pro Termin mit Namen laden und daraus Zählungen ableiten
        const slotsWithVotes = await Promise.all(
            poll.slots.map(async slot => {
                const votes = await this.prisma.vote.findMany({
                    where: { slotId: slot.id },
                    include: { userSession: { select: { name: true } } },
                    orderBy: { createdAt: 'asc' }
                })

                const voters: Record<'yes' | 'maybe' | 'no', string[]> = {
                    yes: [],
                    maybe: [],
                    no: []
                }
                for (const v of votes) {
                    if (v.status === 'yes' || v.status === 'maybe' || v.status === 'no') {
                        voters[v.status].push(v.userSession.name ?? 'Anonym')
                    }
                }

                const yesCount = voters.yes.length
                const maybeCount = voters.maybe.length
                const noCount = voters.no.length
                const totalVotes = yesCount + maybeCount + noCount

                return {
                    ...slot,
                    yesCount,
                    maybeCount,
                    noCount,
                    totalVotes,
                    percentage: totalVotes > 0 ? Math.round((yesCount / totalVotes) * 100) : 0,
                    voters
                }
            })
        )

        // Sort by best availability
        const sortedSlots = slotsWithVotes.sort((a, b) => {
            if (b.yesCount !== a.yesCount) return b.yesCount - a.yesCount
            if (b.maybeCount !== a.maybeCount) return b.maybeCount - a.maybeCount
            return a.startsAt.getTime() - b.startsAt.getTime()
        })

        return {
            ...poll,
            slots: sortedSlots
        }
    }

    async createUserSession(pollId: string, dto: CreateUserSessionDto) {
        const poll = await this.prisma.poll.findUnique({
            where: { id: pollId }
        })

        if (!poll) {
            throw new NotFoundException('Poll not found')
        }

        const session = await this.prisma.userSession.create({
            data: {
                pollId,
                name: dto.name,
                timezone: dto.timezone
            }
        })

        return {
            id: session.id,
            pollId: session.pollId
        }
    }

    async exportPDF(id: string, lang: PdfLang = 'de'): Promise<Buffer> {
        const poll = await this.getPollWithVotes(id)

        const pdfData = {
            id: poll.id,
            title: poll.title,
            description: poll.description,
            timezone: poll.timezone,
            slots: poll.slots.map(slot => ({
                startsAt: slot.startsAt,
                totalVotes: slot.totalVotes,
                yesCount: slot.yesCount,
                maybeCount: slot.maybeCount,
                noCount: slot.noCount,
                voters: slot.voters
            })),
            createdAt: poll.createdAt
        }

        return generatePollPDF(pdfData, lang)
    }
}

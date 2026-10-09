import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
import { PrismaService } from './prisma.service'
import { CreatePollDto, CreateUserSessionDto } from './dtos/create-poll.dto'
import { generatePollPDF } from '../common/pdf.generator'

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

        // Aggregate vote counts per slot
        const slotsWithVotes = await Promise.all(
            poll.slots.map(async slot => {
                const votes = await this.prisma.vote.groupBy({
                    by: ['status'],
                    where: { slotId: slot.id },
                    _count: true
                })

                const voteCounts: Record<string, number> = {
                    yes: 0,
                    maybe: 0,
                    no: 0
                }

                votes.forEach(v => {
                    if (v.status in voteCounts) {
                        voteCounts[v.status] = v._count
                    }
                })

                const totalVotes = voteCounts.yes + voteCounts.maybe + voteCounts.no

                return {
                    ...slot,
                    yesCount: voteCounts.yes,
                    maybeCount: voteCounts.maybe,
                    noCount: voteCounts.no,
                    totalVotes,
                    percentage: totalVotes > 0 ? Math.round((voteCounts.yes / totalVotes) * 100) : 0
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

    async exportPDF(id: string): Promise<Buffer> {
        const poll = await this.getPollWithVotes(id)

        const pdfData = {
            id: poll.id,
            title: poll.title,
            description: poll.description,
            timezone: poll.timezone,
            slots: poll.slots.map(slot => ({
                startsAt: slot.startsAt,
                endsAt: slot.endsAt,
                yesCount: slot.yesCount,
                maybeCount: slot.maybeCount,
                noCount: slot.noCount,
                totalVotes: slot.totalVotes
            })),
            createdAt: poll.createdAt
        }

        return generatePollPDF(pdfData)
    }
}

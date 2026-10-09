import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../polls/prisma.service'

export interface CastVoteDto {
    slotId: string
    status: 'yes' | 'maybe' | 'no'
}

@Injectable()
export class VotesService {
    constructor(private prisma: PrismaService) {}

    async castVote(pollId: string, userSessionId: string, castVoteDto: CastVoteDto) {
        // Verify poll exists
        const poll = await this.prisma.poll.findUnique({
            where: { id: pollId }
        })
        if (!poll) {
            throw new NotFoundException('Poll not found')
        }

        // Verify slot exists and belongs to poll
        const slot = await this.prisma.pollSlot.findUnique({
            where: { id: castVoteDto.slotId }
        })
        if (!slot || slot.pollId !== pollId) {
            throw new NotFoundException('Slot not found')
        }

        // Verify user session exists and belongs to poll
        const session = await this.prisma.userSession.findUnique({
            where: { id: userSessionId }
        })
        if (!session || session.pollId !== pollId) {
            throw new NotFoundException('User session not found')
        }

        // Validate status
        if (!['yes', 'maybe', 'no'].includes(castVoteDto.status)) {
            throw new BadRequestException('Invalid vote status')
        }

        // Upsert vote (update if exists, create if not)
        const vote = await this.prisma.vote.upsert({
            where: {
                slotId_userSessionId: {
                    slotId: castVoteDto.slotId,
                    userSessionId
                }
            },
            create: {
                pollId,
                slotId: castVoteDto.slotId,
                userSessionId,
                status: castVoteDto.status
            },
            update: {
                status: castVoteDto.status,
                updatedAt: new Date()
            }
        })

        return vote
    }

    async getVotesForSlot(slotId: string) {
        const votes = await this.prisma.vote.groupBy({
            by: ['status'],
            where: { slotId },
            _count: true
        })

        const result: Record<string, number> = {
            yes: 0,
            maybe: 0,
            no: 0
        }

        votes.forEach(v => {
            if (v.status in result) {
                result[v.status] = v._count
            }
        })

        return result
    }

    async getUserVotes(userSessionId: string) {
        const votes = await this.prisma.vote.findMany({
            where: { userSessionId },
            select: {
                slotId: true,
                status: true
            }
        })

        const result: { [slotId: string]: string } = {}
        votes.forEach(v => {
            result[v.slotId] = v.status
        })

        return result
    }
}

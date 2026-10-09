import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    HttpCode,
    Query,
    BadRequestException
} from '@nestjs/common'
import { VotesService } from './votes.service'

interface CastVoteDto {
    slotId: string
    status: 'yes' | 'maybe' | 'no'
}

@Controller('api/votes')
export class VotesController {
    constructor(private votesService: VotesService) {}

    @Post()
    @HttpCode(201)
    async castVote(
        @Query('pollId') pollId: string,
        @Query('sessionId') sessionId: string,
        @Body() castVoteDto: CastVoteDto
    ) {
        if (!pollId || !sessionId) {
            throw new BadRequestException('pollId and sessionId are required')
        }
        return this.votesService.castVote(pollId, sessionId, castVoteDto)
    }

    @Get('user/:sessionId')
    async getUserVotes(@Param('sessionId') sessionId: string) {
        return this.votesService.getUserVotes(sessionId)
    }

    @Get('slot/:slotId')
    async getSlotVotes(@Param('slotId') slotId: string) {
        return this.votesService.getVotesForSlot(slotId)
    }
}

import { Module } from '@nestjs/common'
import { VotesController } from './votes.controller'
import { VotesService } from './votes.service'
import { PollsModule } from '../polls/polls.module'

@Module({
    imports: [PollsModule],
    controllers: [VotesController],
    providers: [VotesService]
})
export class VotesModule {}

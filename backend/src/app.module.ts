import { Module } from '@nestjs/common'
import { PollsModule } from './polls/polls.module'
import { VotesModule } from './votes/votes.module'

@Module({
    imports: [PollsModule, VotesModule]
})
export class AppModule {}

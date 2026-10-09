import { Module } from '@nestjs/common'
import { PollsController } from './polls.controller'
import { PollsService } from './polls.service'
import { PrismaService } from './prisma.service'

@Module({
    controllers: [PollsController],
    providers: [PollsService, PrismaService],
    exports: [PrismaService]
})
export class PollsModule {}

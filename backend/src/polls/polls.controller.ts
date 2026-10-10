import {
    Query,
    Controller,
    Post,
    Get,
    Param,
    Body,
    HttpCode,
    Res,
    HttpException,
    HttpStatus
} from '@nestjs/common'
import { Response } from 'express'
import { PollsService } from './polls.service'
import { CreatePollDto, CreateUserSessionDto } from './dtos/create-poll.dto'

@Controller('api/polls')
export class PollsController {
    constructor(private pollsService: PollsService) {}

    @Post()
    @HttpCode(201)
    async create(@Body() createPollDto: CreatePollDto) {
        return this.pollsService.createPoll(createPollDto)
    }

    @Get(':id')
    async get(@Param('id') id: string) {
        return this.pollsService.getPollWithVotes(id)
    }

    @Post(':id/sessions')
    @HttpCode(201)
    async createSession(@Param('id') pollId: string, @Body() dto: CreateUserSessionDto) {
        return this.pollsService.createUserSession(pollId, dto)
    }

    @Get(':id/export/pdf')
    async exportPDF(@Param('id') id: string, @Query('lang') lang: string, @Res() res: Response) {
        try {
            const pdfBuffer = await this.pollsService.exportPDF(id, lang === 'en' ? 'en' : 'de')
            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader('Content-Disposition', `attachment; filename="poll-${id}.pdf"`)
            res.send(pdfBuffer)
        } catch (error) {
            throw new HttpException('PDF generation failed', HttpStatus.BAD_REQUEST)
        }
    }
}

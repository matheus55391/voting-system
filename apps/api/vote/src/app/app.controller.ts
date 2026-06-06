import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
    VoteDto,
    VoteResponseDto,
    ResultsResponseDto,
    HourlyStatsResponseDto,
} from '@bbb-voting-system/common';
import { VotesService } from './services/votes.service';

@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name);

    constructor(private readonly votesService: VotesService) {}

    @MessagePattern('vote.create')
    async handleVote(@Payload() voteDto: VoteDto): Promise<VoteResponseDto> {
        this.logger.log(`Received vote message: ${JSON.stringify(voteDto)}`);
        return await this.votesService.processVote(voteDto);
    }

    @MessagePattern('vote.getStatus')
    async handleGetStatus(): Promise<ResultsResponseDto> {
        this.logger.log('Received status request');
        return await this.votesService.getVotingStatus();
    }

    @MessagePattern('vote.getHourlyStats')
    async handleGetHourlyStats(): Promise<HourlyStatsResponseDto> {
        this.logger.log('Received hourly stats request');
        return await this.votesService.getHourlyStats();
    }
}

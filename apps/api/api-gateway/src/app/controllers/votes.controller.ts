import {
    ResultsResponseDto,
    VoteDto,
    VoteResponseDto,
    HourlyStatsResponseDto,
} from '@bbb-voting-system/common';
import {
    Body,
    Controller,
    Get,
    Inject,
    Post,
    HttpException,
    HttpStatus,
    Logger,
    Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom, timeout } from 'rxjs';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';

@ApiTags('votes')
@Controller('votes')
export class VotesController {
    private readonly logger = new Logger(VotesController.name);

    constructor(
        @Inject('RABBITMQ_SERVICE') private readonly rabbitClient: ClientProxy
    ) {}

    @Throttle({ default: { limit: 1, ttl: 600000 } })
    @Post()
    @ApiOperation({ summary: 'Registrar um novo voto' })
    @ApiResponse({
        status: 201,
        description: 'Voto registrado com sucesso',
        type: VoteResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Dados inválidos',
    })
    @ApiResponse({
        status: 429,
        description: 'Muitos votos da mesma origem - possível bot detectado',
    })
    async vote(
        @Body() voteDto: VoteDto,
        @Req() req: Request
    ): Promise<VoteResponseDto> {
        this.logger.log(
            `Received vote request for participant: ${voteDto.participantId}`
        );

        try {
            const userAgent = req.headers['user-agent'] || 'unknown';

            const enrichedVoteDto: VoteDto = {
                ...voteDto,
                userAgent,
            };

            this.logger.log(`Vote details - User-Agent: ${userAgent}`);

            this.rabbitClient.emit('vote.create', enrichedVoteDto);

            return {
                message: 'Voto recebido e será processado',
                voteId: 'pending',
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            this.logger.error(
                `Error emitting vote: ${(error as Error).message}`,
                (error as Error).stack
            );
            throw new HttpException(
                'Erro ao processar voto. Tente novamente.',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get()
    @ApiOperation({ summary: 'Obter status completo da votação' })
    @ApiResponse({
        status: 200,
        description: 'Status da votação com candidatos, totais e percentuais',
        type: ResultsResponseDto,
    })
    async getVotingStatus(): Promise<ResultsResponseDto> {
        this.logger.log('Fetching voting status...');

        try {
            const result$ = this.rabbitClient
                .send<ResultsResponseDto>('vote.getStatus', {})
                .pipe(timeout(5000));

            const results = await firstValueFrom(result$);

            this.logger.log(
                `Voting status retrieved: ${results.totalVotes} total votes`
            );
            return results;
        } catch (error) {
            this.logger.error(
                `Error fetching voting status: ${error.message}`,
                error.stack
            );

            if (error.name === 'TimeoutError') {
                throw new HttpException(
                    'Tempo limite excedido ao buscar resultados',
                    HttpStatus.GATEWAY_TIMEOUT
                );
            }

            throw new HttpException(
                'Erro ao buscar resultados da votação',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get('results')
    @ApiOperation({ summary: 'Obter resultados da votação (alias)' })
    @ApiResponse({
        status: 200,
        description: 'Resultados da votação',
        type: ResultsResponseDto,
    })
    async getResults(): Promise<ResultsResponseDto> {
        return this.getVotingStatus();
    }

    @Get('stats/hourly')
    @ApiOperation({
        summary: 'Obter estatísticas de votos agrupadas por hora',
    })
    @ApiResponse({
        status: 200,
        description: 'Estatísticas horárias da votação',
        type: HourlyStatsResponseDto,
    })
    async getHourlyStats(): Promise<HourlyStatsResponseDto> {
        this.logger.log('Fetching hourly voting statistics...');

        try {
            const result$ = this.rabbitClient
                .send<HourlyStatsResponseDto>('vote.getHourlyStats', {})
                .pipe(timeout(5000));

            const stats = await firstValueFrom(result$);

            this.logger.log(
                `Hourly stats retrieved: ${stats.hourlyStats.length} hours`
            );
            return stats;
        } catch (error) {
            this.logger.error(
                `Error fetching hourly stats: ${error.message}`,
                error.stack
            );

            if (error.name === 'TimeoutError') {
                throw new HttpException(
                    'Tempo limite excedido ao buscar estatísticas',
                    HttpStatus.GATEWAY_TIMEOUT
                );
            }

            throw new HttpException(
                'Erro ao buscar estatísticas horárias',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}

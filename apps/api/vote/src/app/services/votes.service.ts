import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
    VoteDto,
    VoteResponseDto,
    ResultsResponseDto,
    ParticipantResult,
    HourlyStatsResponseDto,
    HourlyStatsDto,
} from '@bbb-voting-system/common';
import { PrismaService } from './prisma.service';
import { RedisService } from './redis.service';

@Injectable()
export class VotesService {
    private readonly logger = new Logger(VotesService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
        @Inject('EVENTS_SERVICE') private readonly eventsClient: ClientProxy
    ) {}

    async processVote(voteDto: VoteDto): Promise<VoteResponseDto> {
        this.logger.log(
            `Processing vote for participant: ${voteDto.participantId}`
        );

        try {
            const participant = await this.prisma.participant.findUnique({
                where: { id: voteDto.participantId },
            });

            if (!participant) {
                throw new Error(
                    `Participant ${voteDto.participantId} not found`
                );
            }

            if (!participant.isActive) {
                throw new Error(
                    `Participant ${voteDto.participantId} is not active`
                );
            }

            const vote = await this.prisma.vote.create({
                data: {
                    participantId: voteDto.participantId,
                    userId: voteDto.userId,
                    userAgent: voteDto.userAgent || null,
                },
            });

            this.logger.log(`Vote persisted in database: ${vote.id}`);

            await this.redis.incrementVoteCount(voteDto.participantId);
            await this.redis.incrementTotalVotes();

            this.logger.log(
                `Redis counters updated for participant: ${voteDto.participantId}`
            );

            this.eventsClient.emit('vote.processed', {
                voteId: vote.id,
                participantId: vote.participantId,
                timestamp: vote.createdAt.toISOString(),
            });

            return {
                message: 'Voto registrado com sucesso',
                voteId: vote.id,
                timestamp: vote.createdAt.toISOString(),
            };
        } catch (error) {
            this.logger.error(
                `Error processing vote: ${error.message}`,
                error.stack
            );
            throw error;
        }
    }

    async getVotingStatus(): Promise<ResultsResponseDto> {
        this.logger.log('Fetching voting status...');

        try {
            const participants = await this.prisma.participant.findMany({
                where: { isActive: true },
                select: { id: true, name: true },
            });

            let totalVotes = await this.redis.getTotalVotes();
            const results: ParticipantResult[] = [];

            if (totalVotes === 0) {
                this.logger.log('Cache miss - fetching from database...');
                await this.syncRedisFromDatabase();
                totalVotes = await this.redis.getTotalVotes();
            }

            for (const participant of participants) {
                const votes = await this.redis.getVoteCount(participant.id);
                const percentage =
                    totalVotes > 0 ? (votes / totalVotes) * 100 : 0;

                results.push({
                    participantId: participant.id,
                    name: participant.name,
                    votes,
                    percentage: parseFloat(percentage.toFixed(2)),
                });
            }

            results.sort((a, b) => b.votes - a.votes);

            return {
                totalVotes,
                results,
                lastUpdated: new Date().toISOString(),
            };
        } catch (error) {
            this.logger.error(
                `Error fetching voting status: ${error.message}`,
                error.stack
            );
            throw error;
        }
    }

    private async syncRedisFromDatabase(): Promise<void> {
        this.logger.log('Syncing Redis from database...');

        const voteCounts = await this.prisma.vote.groupBy({
            by: ['participantId'],
            _count: {
                id: true,
            },
        });

        await this.redis.clearAllVotes();

        let totalVotes = 0;
        for (const voteCount of voteCounts) {
            const count = voteCount._count.id;
            await this.redis.setVoteCount(voteCount.participantId, count);
            totalVotes += count;
        }

        await this.redis.setTotalVotes(totalVotes);
        this.logger.log(`Redis synced: ${totalVotes} total votes`);
    }

    async getHourlyStats(): Promise<HourlyStatsResponseDto> {
        this.logger.log('Fetching hourly voting statistics...');

        try {
            const hourlyData = await this.prisma.$queryRaw<
                Array<{ hour: Date; votes: bigint }>
            >`
                SELECT
                    DATE_TRUNC('hour', created_at) as hour,
                    COUNT(*)::bigint as votes
                FROM votes
                GROUP BY DATE_TRUNC('hour', created_at)
                ORDER BY hour DESC
            `;

            const hourlyStats: HourlyStatsDto[] = hourlyData.map((row) => ({
                hour: row.hour.toISOString(),
                votes: Number(row.votes),
            }));

            const totalVotes = hourlyStats.reduce(
                (sum, stat) => sum + stat.votes,
                0
            );

            this.logger.log(
                `Hourly stats retrieved: ${hourlyStats.length} hours, ${totalVotes} total votes`
            );

            return {
                hourlyStats,
                totalVotes,
                lastUpdated: new Date().toISOString(),
            };
        } catch (error) {
            this.logger.error(
                `Error fetching hourly stats: ${error.message}`,
                error.stack
            );
            throw error;
        }
    }
}

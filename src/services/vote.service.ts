import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class VoteService {
  constructor(private prisma: PrismaService) {}

  async createVote(params: {
    poolId: string;
    voteOption: number;
    voterToken?: string;
  }) {
    const { poolId, voteOption, voterToken } = params;

    const pool = await this.prisma.pool.findUnique({
      where: {
        id: poolId,
      },
    });

    if (!pool) {
      throw new Error('Pool not found.');
    }

    if (pool.options.length - 1 < voteOption) {
      throw new Error('Invalid option.');
    }

    if (pool.endsAt && pool.endsAt.getTime < new Date().getTime) {
      throw new Error('Pool already ended.');
    }

    if (voterToken) {
      if (pool.creatorToken === voterToken) {
        throw new Error('Pool creator can not vote.');
      }

      const hasAlreadyVoted = await this.prisma.vote.findUnique({
        where: {
          voterToken_poolId: {
            poolId,
            voterToken,
          },
        },
      });
      if (hasAlreadyVoted) {
        throw new Error('User already voted.');
      }
    }

    const vote = await this.prisma.vote.create({
      data: {
        poolId,
        option: voteOption,
        voterToken,
      },
    });

    return vote;
  }

  async getUserVote(params: { voterToken: string; poolId: string }) {
    const { voterToken, poolId } = params;

    const vote = await this.prisma.vote.findUnique({
      where: {
        voterToken_poolId: {
          poolId,
          voterToken,
        },
      },
    });

    return vote;
  }
}

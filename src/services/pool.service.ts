import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class PoolService {
  constructor(private prisma: PrismaService) {}

  async createPool(params: {
    creatorToken?: string;
    question: string;
    options: string[];
    endsAt?: Date;
  }) {
    const { creatorToken, question, options, endsAt } = params;

    const newPool = await this.prisma.pool.create({
      data: {
        creatorToken,
        endsAt,
        question,
        options,
      },
    });

    return newPool;
  }

  async getPool(params: { poolId: string }) {
    const { poolId } = params;

    const pool = await this.prisma.pool.findUnique({
      where: {
        id: poolId,
      },
    });

    return pool;
  }

  async getResults(params: { poolId: string }) {
    const { poolId } = params;

    const poolResults = await this.prisma.vote.groupBy({
      where: {
        poolId,
      },
      by: ['option'],
      _count: true,
    });

    if (!poolResults) {
      throw new Error('Pool not found.');
    }

    return poolResults;
  }
}

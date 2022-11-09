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

  async endPool(params: { poolId: string; userToken: string }) {
    const { poolId, userToken } = params;

    const pool = await this.prisma.pool.findUnique({
      where: {
        id: poolId,
      },
    });

    if (!pool) {
      throw new Error('Pool not found');
    } else if (pool.creatorToken !== userToken) {
      throw new Error('Not allowed.');
    }

    const updatedPool = await this.prisma.pool.update({
      where: {
        id: pool.id,
      },
      data: {
        endsAt: new Date(),
      },
    });

    return updatedPool;
  }

  async deletePool(params: { poolId: string; userToken: string }) {
    const { poolId, userToken } = params;

    const pool = await this.prisma.pool.findUnique({
      where: {
        id: poolId,
      },
    });

    if (!pool) {
      throw new Error('Pool not found');
    } else if (pool.creatorToken !== userToken) {
      throw new Error('Not allowed.');
    }

    const deletedPool = await this.prisma.pool.delete({
      where: {
        id: poolId,
      },
    });

    return deletedPool;
  }
}

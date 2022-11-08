import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class PoolService {
  constructor(private prisma: PrismaService) {}

  async createPool(params: {
    creatorToken?: string;
    question: string;
    options: string[];
  }) {
    const { creatorToken, question, options } = params;

    const newPool = await this.prisma.pool.create({
      data: {
        ...(creatorToken ? { creatorToken } : {}),
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
}

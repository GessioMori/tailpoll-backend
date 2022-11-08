import { Body, Controller, Post } from '@nestjs/common';
import { Pool } from '@prisma/client';
import { PoolService } from 'src/services/pool.service';

@Controller()
export class PoolController {
  constructor(private readonly poolService: PoolService) {}

  @Post('pool')
  async createPool(
    @Body()
    poolData: {
      creatorToken?: string;
      question: string;
      options: string[];
    },
  ): Promise<Pool> {
    const { creatorToken, question, options } = poolData;

    const newPool = await this.poolService.createPool({
      creatorToken,
      options,
      question,
    });

    return newPool;
  }

  @Post('pool')
  async getPool(
    @Body()
    poolData: {
      poolId: string;
    },
  ): Promise<Pool | null> {
    const { poolId } = poolData;

    return this.poolService.getPool({ poolId });
  }
}

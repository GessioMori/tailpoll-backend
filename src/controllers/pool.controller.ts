import { Body, Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { PoolService } from 'src/services/pool.service';

@Controller()
export class PoolController {
  constructor(private readonly poolService: PoolService) {}

  @Post('pool')
  async createPool(
    @Body()
    poolData: {
      question: string;
      options: string[];
    },
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { question, options } = poolData;
    const { creatorToken } = request.signedCookies;

    const newPool = await this.poolService.createPool({
      creatorToken,
      options,
      question,
    });

    if (!creatorToken) {
      response.cookie('creatorToken', newPool.creatorToken, {
        httpOnly: true,
        maxAge: 999999999,
        sameSite: 'lax',
        secure: false,
        signed: true,
      });
    }

    return newPool;
  }

  @Get('pool/:id')
  async getPool(@Param('id') id: string, @Req() request: Request) {
    const pool = await this.poolService.getPool({ poolId: id });

    return {
      pool,
      isOwner: pool?.creatorToken === request.signedCookies.creatorToken,
    };
  }
}

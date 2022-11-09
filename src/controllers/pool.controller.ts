import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UsePipes,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PoolService } from 'src/services/pool.service';
import { CreatePoolDto, PoolSchema } from './dto/pool.dto';
import { ValidatorPipe } from './validation.pipe';

@Controller()
export class PoolController {
  constructor(private readonly poolService: PoolService) {}

  @Post('pool')
  @UsePipes(new ValidatorPipe(PoolSchema))
  async createPool(
    @Body()
    createPoolDto: CreatePoolDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { question, options, endsAt } = createPoolDto;
    const { creatorToken } = request.signedCookies;

    const newPool = await this.poolService.createPool({
      creatorToken,
      options,
      question,
      endsAt,
    });

    if (!creatorToken) {
      response.cookie('creatorToken', newPool.creatorToken, {
        httpOnly: true,
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

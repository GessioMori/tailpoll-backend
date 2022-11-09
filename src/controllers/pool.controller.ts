import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
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
    const { userToken } = request.signedCookies;

    const newPool = await this.poolService.createPool({
      creatorToken: userToken,
      options,
      question,
      endsAt,
    });

    if (!userToken) {
      response.cookie('userToken', newPool.creatorToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        signed: true,
      });
    }

    return newPool;
  }

  @Get('pool/:id')
  @UsePipes(new ValidatorPipe())
  async getPool(@Param('id') id: string, @Req() request: Request) {
    const pool = await this.poolService.getPool({ poolId: id });

    return {
      pool,
      isOwner: pool?.creatorToken === request.signedCookies.userToken,
    };
  }

  @Get('result/:id')
  @UsePipes(new ValidatorPipe())
  async getResults(@Param('id') id: string) {
    try {
      const results = await this.poolService.getResults({ poolId: id });
      return results;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  @Patch('pool/:id')
  @UsePipes(new ValidatorPipe())
  async endPool(@Param('id') id: string, @Req() request: Request) {
    const { userToken } = request.signedCookies;

    try {
      const updatedPool = await this.poolService.endPool({
        poolId: id,
        userToken,
      });

      return updatedPool;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  @Delete('pool/:id')
  @UsePipes(new ValidatorPipe())
  async deletePool(@Param('id') id: string, @Req() request: Request) {
    const { userToken } = request.signedCookies;

    try {
      const deletedPool = await this.poolService.endPool({
        poolId: id,
        userToken,
      });

      return deletedPool;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }
}

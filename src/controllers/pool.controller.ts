import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UsePipes,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PoolService } from '../services/pool.service';
import { cookieConfig } from '../utils/cookieConfig';
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
      response.cookie('userToken', newPool.creatorToken, cookieConfig);
    }

    return newPool;
  }

  @Get('pool')
  @UsePipes(new ValidatorPipe())
  async getPool(@Query() query: { id: string }, @Req() request: Request) {
    const pool = await this.poolService.getPool({ poolId: query.id });

    if (!pool) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    return {
      pool,
      isOwner: pool?.creatorToken === request.signedCookies.userToken,
    };
  }

  @Get('result')
  @UsePipes(new ValidatorPipe())
  async getResults(@Query() query: { id: string }) {
    try {
      const results = await this.poolService.getResults({ poolId: query.id });
      return results;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('pool')
  @UsePipes(new ValidatorPipe())
  async endPool(@Query() query: { id: string }, @Req() request: Request) {
    const { userToken } = request.signedCookies;

    try {
      const updatedPool = await this.poolService.endPool({
        poolId: query.id,
        userToken,
      });

      return updatedPool;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('pool')
  @UsePipes(new ValidatorPipe())
  async deletePool(
    @Query() query: { id: string },
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { userToken } = request.signedCookies;

    try {
      await this.poolService.deletePool({
        poolId: query.id,
        userToken,
      });

      response.status(HttpStatus.NO_CONTENT);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('pools')
  async getUserPools(@Req() request: Request) {
    const { userToken } = request.signedCookies;

    if (!userToken) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    try {
      const pools = await this.poolService.getUserPools({ userToken });

      return pools;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}

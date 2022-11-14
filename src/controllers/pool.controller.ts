import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UsePipes,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PoolService } from '../services/pool.service';
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

    if (!pool) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

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
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
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
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('pool/:id')
  @UsePipes(new ValidatorPipe())
  async deletePool(@Param('id') id: string, @Req() request: Request) {
    const { userToken } = request.signedCookies;

    try {
      const deletedPool = await this.poolService.deletePool({
        poolId: id,
        userToken,
      });

      return deletedPool;
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

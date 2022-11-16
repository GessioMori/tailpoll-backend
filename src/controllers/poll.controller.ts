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
import { PoolService } from '../services/poll.service';
import { cookieConfig } from '../utils/cookieConfig';
import { CreatePoolDto, PoolSchema } from './dto/poll.dto';
import { ValidatorPipe } from './validation.pipe';

@Controller()
export class PoolController {
  constructor(private readonly pollService: PoolService) {}

  @Post('poll')
  @UsePipes(new ValidatorPipe(PoolSchema))
  async createPool(
    @Body()
    createPoolDto: CreatePoolDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { question, options, endsAt } = createPoolDto;
    const { userToken } = request.signedCookies;

    const newPool = await this.pollService.createPool({
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

  @Get('poll')
  @UsePipes(new ValidatorPipe())
  async getPool(@Query() query: { id: string }, @Req() request: Request) {
    const poll = await this.pollService.getPool({ pollId: query.id });

    if (!poll) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    return {
      poll,
      isOwner: poll?.creatorToken === request.signedCookies.userToken,
    };
  }

  @Get('result')
  @UsePipes(new ValidatorPipe())
  async getResults(@Query() query: { id: string }) {
    try {
      const results = await this.pollService.getResults({ pollId: query.id });
      return results;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('poll')
  @UsePipes(new ValidatorPipe())
  async endPool(@Query() query: { id: string }, @Req() request: Request) {
    const { userToken } = request.signedCookies;

    try {
      const updatedPool = await this.pollService.endPool({
        pollId: query.id,
        userToken,
      });

      return updatedPool;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('poll')
  @UsePipes(new ValidatorPipe())
  async deletePool(
    @Query() query: { id: string },
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { userToken } = request.signedCookies;

    try {
      await this.pollService.deletePool({
        pollId: query.id,
        userToken,
      });

      response.status(HttpStatus.NO_CONTENT);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('polls')
  async getUserPools(@Req() request: Request) {
    const { userToken } = request.signedCookies;

    if (!userToken) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    try {
      const polls = await this.pollService.getUserPools({ userToken });

      return polls;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}

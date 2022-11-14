import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UsePipes,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { VoteService } from '../services/vote.service';
import { cookieConfig } from '../utils/cookieConfig';
import { CreateVoteDto, VoteSchema } from './dto/vote.dto';
import { ValidatorPipe } from './validation.pipe';

@Controller()
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @Post('vote')
  @UsePipes(new ValidatorPipe(VoteSchema))
  async vote(
    @Query() query: { id: string },
    @Body() body: CreateVoteDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { option } = body;
    const { userToken } = request.signedCookies;

    try {
      const vote = await this.voteService.createVote({
        poolId: query.id,
        voteOption: option,
        voterToken: userToken,
      });

      if (!userToken) {
        response.cookie('userToken', vote.voterToken, cookieConfig);
      }

      return vote;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('vote')
  @UsePipes(new ValidatorPipe())
  async getUserVote(@Query() query: { id: string }, @Req() request: Request) {
    const { userToken } = request.signedCookies;

    if (!userToken) {
      throw new HttpException('Voter not found', HttpStatus.BAD_REQUEST);
    }

    const userVote = await this.voteService.getUserVote({
      poolId: query.id,
      voterToken: userToken,
    });

    if (!userVote) {
      throw new HttpException('Vote not found', HttpStatus.NOT_FOUND);
    }

    return userVote;
  }

  @Get('votes')
  async getUserVotes(@Req() request: Request) {
    const { userToken } = request.signedCookies;

    if (!userToken) {
      throw new HttpException('Voter not found', HttpStatus.BAD_REQUEST);
    }

    try {
      const votes = await this.voteService.getUserVotes({ userToken });
      return votes;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}

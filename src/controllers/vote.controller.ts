import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UsePipes,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { VoteService } from '../services/vote.service';
import { CreateVoteDto, VoteSchema } from './dto/vote.dto';
import { ValidatorPipe } from './validation.pipe';

@Controller()
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @Post('vote/:id')
  @UsePipes(new ValidatorPipe(VoteSchema))
  async vote(
    @Param('id') id: string,
    @Body() body: CreateVoteDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { option } = body;
    const { userToken } = request.signedCookies;

    try {
      const vote = await this.voteService.createVote({
        poolId: id,
        voteOption: option,
        voterToken: userToken,
      });

      if (!userToken) {
        response.cookie('userToken', vote.voterToken, {
          httpOnly: true,
          sameSite: 'lax',
          secure: false,
          signed: true,
        });
      }

      return vote;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('vote/:id')
  @UsePipes(new ValidatorPipe())
  async getUserVote(@Param('id') id: string, @Req() request: Request) {
    const { userToken } = request.signedCookies;

    if (!userToken) {
      throw new HttpException('Voter not found', HttpStatus.BAD_REQUEST);
    }

    const userVote = await this.voteService.getUserVote({
      poolId: id,
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

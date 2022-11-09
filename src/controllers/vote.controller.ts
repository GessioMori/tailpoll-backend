import {
  Body,
  Controller,
  HttpException,
  Param,
  Post,
  Req,
  Res,
  UsePipes,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { VoteService } from 'src/services/vote.service';
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
      throw new HttpException(error.message, 400);
    }
  }
}

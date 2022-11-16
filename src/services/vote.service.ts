import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class VoteService {
  constructor(private prisma: PrismaService) {}

  async createVote(params: {
    pollId: string;
    voteOption: number;
    voterToken?: string;
  }) {
    const { pollId, voteOption, voterToken } = params;

    const poll = await this.prisma.poll.findUnique({
      where: {
        id: pollId,
      },
    });

    if (!poll) {
      throw new Error('Poll not found.');
    } else if (poll.options.length - 1 < voteOption) {
      throw new Error('Invalid option.');
    } else if (poll.endsAt && poll.endsAt.getTime() < new Date().getTime()) {
      throw new Error('Poll already ended.');
    }

    if (voterToken) {
      if (poll.creatorToken === voterToken) {
        throw new Error('Poll creator can not vote.');
      }

      const hasAlreadyVoted = await this.prisma.vote.findUnique({
        where: {
          voterToken_pollId: {
            pollId,
            voterToken,
          },
        },
      });
      if (hasAlreadyVoted) {
        throw new Error('User already voted.');
      }
    }

    const vote = await this.prisma.vote.create({
      data: {
        pollId,
        option: voteOption,
        voterToken,
      },
    });

    return vote;
  }

  async getUserVote(params: { voterToken: string; pollId: string }) {
    const { voterToken, pollId } = params;

    const vote = await this.prisma.vote.findUnique({
      where: {
        voterToken_pollId: {
          pollId,
          voterToken,
        },
      },
    });

    return vote;
  }

  async getUserVotes(params: { userToken: string }) {
    const { userToken } = params;

    const votes = await this.prisma.vote.findMany({
      where: {
        voterToken: userToken,
      },
      include: {
        poll: true,
      },
    });

    return votes;
  }
}

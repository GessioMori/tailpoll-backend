import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class PoolService {
  constructor(private prisma: PrismaService) {}

  async createPool(params: {
    creatorToken?: string;
    question: string;
    options: string[];
    endsAt?: Date;
  }) {
    const { creatorToken, question, options, endsAt } = params;

    const newPool = await this.prisma.poll.create({
      data: {
        creatorToken,
        endsAt,
        question,
        options,
      },
    });

    return newPool;
  }

  async getPool(params: { pollId: string }) {
    const { pollId } = params;

    const poll = await this.prisma.poll.findUnique({
      where: {
        id: pollId,
      },
    });

    return poll;
  }

  async getResults(params: { pollId: string }) {
    const { pollId } = params;

    const pollResults = await this.prisma.vote.groupBy({
      where: {
        pollId,
      },
      by: ['option'],
      _count: true,
    });

    if (!pollResults) {
      throw new Error('Poll not found.');
    }

    return pollResults;
  }

  async endPool(params: { pollId: string; userToken: string }) {
    const { pollId, userToken } = params;

    const poll = await this.prisma.poll.findUnique({
      where: {
        id: pollId,
      },
    });

    if (!poll) {
      throw new Error('Poll not found');
    } else if (poll.creatorToken !== userToken) {
      throw new Error('Not allowed.');
    } else if (poll.endsAt) {
      throw new Error('Poll already ended.');
    }

    const updatedPool = await this.prisma.poll.update({
      where: {
        id: poll.id,
      },
      data: {
        endsAt: new Date(),
      },
    });

    return updatedPool;
  }

  async deletePool(params: { pollId: string; userToken: string }) {
    const { pollId, userToken } = params;

    const poll = await this.prisma.poll.findUnique({
      where: {
        id: pollId,
      },
    });

    if (!poll) {
      throw new Error('Poll not found');
    } else if (poll.creatorToken !== userToken) {
      throw new Error('Not allowed.');
    }

    const deletedPool = await this.prisma.poll.delete({
      where: {
        id: pollId,
      },
    });

    return deletedPool;
  }

  async getUserPools(params: { userToken: string }) {
    const { userToken } = params;

    const polls = await this.prisma.poll.findMany({
      where: {
        creatorToken: userToken,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return polls;
  }
}

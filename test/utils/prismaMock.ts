import { Vote } from '@prisma/client';
import { CreatePoolDto } from '../../src/controllers/dto/pool.dto';

export const uuid1 = '58439dd96e794b488ce10b2f12a4f213';
export const uuid2 = 'cfd8a37dfa9d448d924d9fef70ab1c1b';
export const uuid3 = 'cfd8a37dfa9d448d924d9fef70ab1c1f';
export const uuid4 = '5fa5c8611ecb4372bc7a69fcc66fdfe8';

export const mockPrisma = {
  pool: {
    findUnique: (args: { where: { id: string } }) => ({
      creatorToken: uuid1,
      question: 'question question?',
      options: ['opt1', 'opt2'],
      id: args.where.id,
      createdAt: '2022-11-11T11:00:10.851Z',
      ...(args.where.id === uuid2
        ? { endsAt: new Date('2022-10-11T11:00:10.851Z') }
        : {}),
    }),
    create: (args: { data: CreatePoolDto & { creatorToken?: string } }) => ({
      ...args.data,
      creatorToken: args.data.creatorToken ?? uuid1,
      id: uuid2,
      createdAt: new Date(),
    }),
    update: (args: {
      where: {
        id: string;
      };
      data: {
        endsAt: Date;
      };
    }) => ({
      creatorToken: uuid1,
      question: 'question question?',
      options: ['opt1', 'opt2'],
      id: args.where.id,
      createdAt: '2022-11-11T11:00:10.851Z',
      endsAt: new Date(),
    }),
    delete: (args: {
      where: {
        id: string;
      };
    }) => ({
      creatorToken: uuid1,
      question: 'question question?',
      options: ['opt1', 'opt2'],
      id: args.where.id,
      createdAt: '2022-11-11T11:00:10.851Z',
      endsAt: new Date(),
    }),
  },
  vote: {
    findUnique: (args: {
      where: {
        voterToken_poolId: {
          poolId: string;
          voterToken: string;
        };
      };
    }): Vote | null => {
      if (args.where.voterToken_poolId.voterToken === uuid2) {
        return {
          voterToken: uuid2,
          id: uuid3,
          createdAt: new Date(),
          option: 1,
          poolId: args.where.voterToken_poolId.poolId,
        };
      }
      return null;
    },
    create: (args: {
      data: {
        poolId: string;
        option: number;
        voterToken?: string;
      };
    }): Vote => ({
      createdAt: new Date(),
      id: uuid3,
      option: args.data.option,
      poolId: args.data.poolId,
      voterToken: args.data.voterToken ?? uuid2,
    }),
    groupBy: (args: {
      where: {
        poolId: string;
      };
      by: ['option'];
      _count: true;
    }) =>
      args.where.poolId === uuid2
        ? [
            { option: 0, votes: 1 },
            { option: 1, votes: 2 },
          ]
        : [{ option: 1, votes: 2 }],
  },
};

import { Vote } from '@prisma/client';
import { CreatePoolDto } from '../../src/controllers/dto/pool.dto';

export const uuid1 = '58439dd96e794b488ce10b2f12a4f213';
export const uuid2 = 'cfd8a37dfa9d448d924d9fef70ab1c1b';
export const uuid3 = 'cfd8a37dfa9d448d924d9fef70ab1c1f';
export const uuid4 = '5fa5c8611ecb4372bc7a69fcc66fdfe8';

const voteResponse1 = {
  id: 'clagp4iao0002wlsv5at5sdhl',
  createdAt: '2022-11-14T11:22:08.929Z',
  voterToken: 'clagp4iao0003wlsvt3z898a0',
  option: 3,
  poolId: 'clagouv130001wlinf556uyci',
  pool: {
    id: 'clagouv130001wlinf556uyci',
    createdAt: '2022-11-14T11:14:38.871Z',
    endsAt: null,
    creatorToken: 'clagouv130000wlinm15ul5ua',
    question: 'pool to test votes 4',
    options: ['opt1', 'opt2', 'opt3', 'opt4'],
  },
};

const voteResponse2 = {
  id: 'clagp4t530005wlsv4i430u1j',
  createdAt: '2022-11-14T11:22:22.983Z',
  voterToken: 'clagp4iao0003wlsvt3z898a0',
  option: 3,
  poolId: 'clagouxzj0004wlina8oie18b',
  pool: {
    id: 'clagouxzj0004wlina8oie18b',
    createdAt: '2022-11-14T11:14:42.703Z',
    endsAt: null,
    creatorToken: 'clagouv130000wlinm15ul5ua',
    question: 'pool to test votes 5',
    options: ['opt1', 'opt2', 'opt3', 'opt4'],
  },
};

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
    findMany: (args: { where: { creatorToken: string } }) => [
      {
        creatorToken: args.where.creatorToken,
        question: 'question question?',
        options: ['opt1', 'opt2'],
        id: uuid2,
        createdAt: '2022-11-11T11:00:10.851Z',
        endsAt: new Date('2022-10-11T11:00:10.851Z'),
      },
      {
        creatorToken: args.where.creatorToken,
        question: 'question question 2?',
        options: ['opt1', 'opt2', 'opt3'],
        id: uuid3,
        createdAt: '2022-10-11T11:00:10.851Z',
      },
    ],
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
    findMany: () => [voteResponse1, voteResponse2],
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

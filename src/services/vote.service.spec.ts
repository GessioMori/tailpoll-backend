import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Vote } from '@prisma/client';
import { PrismaService } from '../services/prisma.service';
import { VoteService } from './vote.service';

describe('Vote service', () => {
  let app: INestApplication;
  let voteService: VoteService;

  const uuid1 = '58439dd9-6e79-4b48-8ce1-0b2f12a4f213';
  const uuid2 = 'cfd8a37d-fa9d-448d-924d-9fef70ab1c1b';
  const uuid3 = 'ae9dc052-eea5-4ec2-88ce-93656c8c0134';
  const uuid4 = '5fa5c861-1ecb-4372-bc7a-69fcc66fdfe8';

  const mockPrisma = {
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
        poolId: uuid1,
        voterToken: args.data.voterToken ?? uuid2,
      }),
    },
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [VoteService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleRef.createNestApplication();

    voteService = app.get<VoteService>(VoteService);
  });

  it('should create a new vote for unidentified user', async () => {
    const vote = await voteService.createVote({ poolId: uuid4, voteOption: 1 });

    expect(vote.id).toEqual(uuid3);
    expect(vote.voterToken).toEqual(uuid2);
  });

  it('should not vote on unvalid option', async () => {
    expect(
      async () =>
        await voteService.createVote({ poolId: uuid4, voteOption: 2 }),
    ).rejects.toThrowError('Invalid option.');
  });

  it('should not vote in a closed pool', async () => {
    expect(
      async () =>
        await voteService.createVote({ poolId: uuid2, voteOption: 1 }),
    ).rejects.toThrowError('Pool already ended.');
  });

  it('should not accept pool creator vote', async () => {
    expect(
      async () =>
        await voteService.createVote({
          poolId: uuid4,
          voteOption: 1,
          voterToken: uuid1,
        }),
    ).rejects.toThrowError('Pool creator can not vote.');
  });

  it('should not accept repeated voter', async () => {
    expect(
      async () =>
        await voteService.createVote({
          poolId: uuid4,
          voteOption: 1,
          voterToken: uuid2,
        }),
    ).rejects.toThrowError('User already voted.');
  });
});

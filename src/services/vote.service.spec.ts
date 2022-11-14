import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  mockPrisma,
  uuid1,
  uuid2,
  uuid3,
  uuid4,
} from '../../test/utils/prismaMock';
import { PrismaService } from '../services/prisma.service';
import { VoteService } from './vote.service';

describe('Vote service', () => {
  let app: INestApplication;
  let voteService: VoteService;

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

  afterAll(async () => await app.close());

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

  it('should get all user votes', async () => {
    const votes = await voteService.getUserVotes({ userToken: uuid1 });

    expect(votes).toHaveLength(2);
  });
});

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mockPrisma, uuid1, uuid2, uuid4 } from '../../test/utils/prismaMock';
import { PoolService } from '../services/poll.service';
import { PrismaService } from './prisma.service';

describe('Poll service', () => {
  let app: INestApplication;
  let pollService: PoolService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [PoolService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleRef.createNestApplication();

    pollService = app.get<PoolService>(PoolService);
  });

  afterAll(async () => await app.close());

  it('should create a new poll', async () => {
    const options = ['opt1', 'opt2'];
    const question = 'question question?';

    const newPool = await pollService.createPool({
      options,
      question,
      creatorToken: uuid1,
      endsAt: new Date(),
    });

    expect(newPool.id).toBeTruthy();
  });

  it('should be able to end a poll', async () => {
    const updatedPool = await pollService.endPool({
      pollId: uuid1,
      userToken: uuid1,
    });

    expect(updatedPool.endsAt).toBeTruthy();
  });

  it('should not be able to end an ended poll', () => {
    expect(
      async () =>
        await pollService.endPool({
          pollId: uuid2,
          userToken: uuid1,
        }),
    ).rejects.toThrowError('Poll already ended.');
  });

  it('should not be able to end a poll by some other user', () => {
    expect(
      async () =>
        await pollService.endPool({
          pollId: uuid1,
          userToken: uuid2,
        }),
    ).rejects.toThrowError('Not allowed.');
  });

  it('should not be able to delete a poll by some other user', () => {
    expect(
      async () =>
        await pollService.deletePool({
          pollId: uuid1,
          userToken: uuid2,
        }),
    ).rejects.toThrowError('Not allowed.');
  });

  it('should be able to get all user polls', async () => {
    const polls = await pollService.getUserPools({ userToken: uuid4 });

    expect(polls).toHaveLength(2);
  });
});

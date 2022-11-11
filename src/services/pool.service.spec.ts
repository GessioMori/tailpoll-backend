import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreatePoolDto } from '../controllers/dto/pool.dto';
import { PoolService } from '../services/pool.service';
import { PrismaService } from '../services/prisma.service';

describe('Pool service', () => {
  let app: INestApplication;
  let poolService: PoolService;

  const uuid1 = '58439dd9-6e79-4b48-8ce1-0b2f12a4f213';
  const uuid2 = 'cfd8a37d-fa9d-448d-924d-9fef70ab1c1b';

  const mockPrisma = {
    pool: {
      create: (args: { data: CreatePoolDto & { creatorToken?: string } }) => ({
        ...args.data,
        creatorToken: args.data.creatorToken ?? uuid1,
        id: uuid2,
        createdAt: new Date(),
      }),
      findUnique: (args: { where: { id: string } }) => ({
        creatorToken: uuid1,
        question: 'question question?',
        options: ['opt1', 'opt2'],
        id: args.where.id,
        createdAt: '2022-11-11T11:00:10.851Z',
        ...(args.where.id === uuid2 ? { endsAt: new Date() } : {}),
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
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [PoolService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleRef.createNestApplication();

    poolService = app.get<PoolService>(PoolService);
  });

  it('should create a new pool', async () => {
    const options = ['opt1', 'opt2'];
    const question = 'question question?';

    const newPool = await poolService.createPool({
      options,
      question,
      creatorToken: uuid1,
      endsAt: new Date(),
    });

    expect(newPool.id).toBeTruthy();
  });

  it('should be able to end a pool', async () => {
    const updatedPool = await poolService.endPool({
      poolId: uuid1,
      userToken: uuid1,
    });

    expect(updatedPool.endsAt).toBeTruthy();
  });

  it('should not be able to end an ended pool', () => {
    expect(
      async () =>
        await poolService.endPool({
          poolId: uuid2,
          userToken: uuid1,
        }),
    ).rejects.toThrowError('Pool already ended.');
  });

  it('should not be able to end a pool by some other user', () => {
    expect(
      async () =>
        await poolService.endPool({
          poolId: uuid1,
          userToken: uuid2,
        }),
    ).rejects.toThrowError('Not allowed.');
  });

  it('should not be able to delete a pool by some other user', () => {
    expect(
      async () =>
        await poolService.deletePool({
          poolId: uuid1,
          userToken: uuid2,
        }),
    ).rejects.toThrowError('Not allowed.');
  });
});

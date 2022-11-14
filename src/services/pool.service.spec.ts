import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mockPrisma, uuid1, uuid2 } from '../../test/utils/prismaMock';
import { PoolService } from '../services/pool.service';
import { PrismaService } from '../services/prisma.service';

describe('Pool service', () => {
  let app: INestApplication;
  let poolService: PoolService;

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

  afterAll(async () => await app.close());

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

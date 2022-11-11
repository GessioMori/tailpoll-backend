import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import crypto from 'node:crypto';
import * as request from 'supertest';
import { CreatePoolDto } from '../controllers/dto/pool.dto';
import { PoolController } from '../controllers/pool.controller';
import { PoolService } from './pool.service';
import { PrismaService } from './prisma.service';

describe('Pool service', () => {
  let app: INestApplication;

  const mockPrisma = {
    pool: {
      create: (args: { data: CreatePoolDto & { creatorToken?: string } }) => ({
        ...args.data,
        creatorToken: args.data.creatorToken ?? crypto.randomUUID(),
        id: crypto.randomUUID(),
        createdAt: new Date(),
      }),
    },
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [PoolController],
      providers: [PoolService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('should create a new pool', async () => {
    const newPool = await request(app.getHttpServer())
      .post('/pool')
      .send({
        options: ['opt1', 'opt2'],
        question: 'question question?',
      });

    expect(newPool.status).toBe(200);
  });
});

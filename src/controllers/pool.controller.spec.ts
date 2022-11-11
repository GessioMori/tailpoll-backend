import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { PoolService } from '../services/pool.service';
import { PrismaService } from '../services/prisma.service';
import { CreatePoolDto } from './dto/pool.dto';
import { PoolController } from './pool.controller';

describe('Pool controller', () => {
  let app: INestApplication;

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
    app.use(cookieParser(process.env.COOKIE_SECRET));
    await app.init();
  });

  it('should create a new pool', async () => {
    const body = {
      options: ['opt1', 'opt2'],
      question: 'question question?',
    };

    const newPool = await request(app.getHttpServer()).post('/pool').send(body);

    expect(newPool.status).toBe(201);
    expect(newPool.body).toHaveProperty('creatorToken', uuid1);
    expect(newPool.body).toHaveProperty('id', uuid2);
    expect(newPool.body).toHaveProperty('options', body.options);
    expect(newPool.body).toHaveProperty('question', body.question);
    expect(newPool.body).toHaveProperty('createdAt');
  });
});

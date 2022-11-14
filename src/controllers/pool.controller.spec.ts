import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { mockPrisma, uuid1, uuid2 } from '../../test/utils/prismaMock';
import { PoolService } from '../services/pool.service';
import { PrismaService } from '../services/prisma.service';
import { PoolController } from './pool.controller';

describe('Pool controller', () => {
  let app: INestApplication;

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

  afterAll(async () => await app.close());

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

  it('should create a new pool with the same user token', async () => {
    const body = {
      options: ['opt1', 'opt2'],
      question: 'question question?',
    };

    const newPool1 = await request(app.getHttpServer())
      .post('/pool')
      .send(body);

    const newPool2 = await request(app.getHttpServer())
      .post('/pool')
      .set('Cookie', [newPool1.headers['set-cookie'][0].split(';')[0]])
      .send(body);

    expect(newPool2.status).toBe(201);
    expect(newPool2.body.creatorToken).toEqual(newPool1.body.creatorToken);
  });

  it('should get a pool', async () => {
    const pool = await request(app.getHttpServer()).get('/pool/' + uuid2);

    expect(pool.body.pool.id).toBeTruthy();
  });

  it('should get a pool with owner informations', async () => {
    const body = {
      options: ['opt1', 'opt2'],
      question: 'question question?',
    };

    const newPool = await request(app.getHttpServer()).post('/pool').send(body);

    const pool = await request(app.getHttpServer())
      .get('/pool/' + uuid2)
      .set('Cookie', [newPool.headers['set-cookie'][0].split(';')[0]]);

    expect(pool.body.isOwner).toBeTruthy();
  });

  it('should be able to delete a pool only by owner', async () => {
    const body = {
      options: ['opt1', 'opt2'],
      question: 'question question?',
    };

    const newPool = await request(app.getHttpServer()).post('/pool').send(body);

    const updatedPool = await request(app.getHttpServer())
      .delete('/pool/' + uuid2)
      .set('Cookie', [newPool.headers['set-cookie'][0].split(';')[0]]);

    expect(updatedPool.body.id).toBeTruthy();
  });

  it('should be able to get pool results', async () => {
    const poolResults = await request(app.getHttpServer()).get(
      '/result/' + uuid2,
    );

    expect(poolResults.body).toHaveLength(2);
  });
});

import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { mockPrisma, uuid1, uuid2 } from '../../test/utils/prismaMock';
import { PoolService } from '../services/poll.service';
import { PrismaService } from '../services/prisma.service';
import { PoolController } from './poll.controller';

describe('Poll controller', () => {
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

  it('should create a new poll', async () => {
    const body = {
      options: ['opt1', 'opt2'],
      question: 'question question?',
    };

    const newPool = await request(app.getHttpServer()).post('/poll').send(body);

    expect(newPool.status).toBe(201);
    expect(newPool.body).toHaveProperty('creatorToken', uuid1);
    expect(newPool.body).toHaveProperty('id', uuid2);
    expect(newPool.body).toHaveProperty('options', body.options);
    expect(newPool.body).toHaveProperty('question', body.question);
    expect(newPool.body).toHaveProperty('createdAt');
  });

  it('should create a new poll with the same user token', async () => {
    const body = {
      options: ['opt1', 'opt2'],
      question: 'question question?',
    };

    const newPool1 = await request(app.getHttpServer())
      .post('/poll')
      .send(body);

    const newPool2 = await request(app.getHttpServer())
      .post('/poll')
      .set('Cookie', [newPool1.headers['set-cookie'][0].split(';')[0]])
      .send(body);

    expect(newPool2.status).toBe(201);
    expect(newPool2.body.creatorToken).toEqual(newPool1.body.creatorToken);
  });

  it('should get a poll', async () => {
    const poll = await request(app.getHttpServer()).get('/poll/?id=' + uuid2);

    expect(poll.body.poll.id).toBeTruthy();
  });

  it('should get a poll with owner informations', async () => {
    const body = {
      options: ['opt1', 'opt2'],
      question: 'question question?',
    };

    const newPool = await request(app.getHttpServer()).post('/poll').send(body);

    const poll = await request(app.getHttpServer())
      .get('/poll/?id=' + uuid2)
      .set('Cookie', [newPool.headers['set-cookie'][0].split(';')[0]]);

    expect(poll.body.isOwner).toBeTruthy();
  });

  it('should be able to delete a poll only by owner', async () => {
    const body = {
      options: ['opt1', 'opt2'],
      question: 'question question?',
    };

    const newPool = await request(app.getHttpServer()).post('/poll').send(body);

    const updatedPool = await request(app.getHttpServer())
      .delete('/poll/?id=' + uuid2)
      .set('Cookie', [newPool.headers['set-cookie'][0].split(';')[0]]);

    expect(updatedPool.status).toEqual(HttpStatus.NO_CONTENT);
  });

  it('should be able to get poll results', async () => {
    const pollResults = await request(app.getHttpServer()).get(
      '/result/?id=' + uuid2,
    );

    expect(pollResults.body).toHaveLength(2);
  });

  it('should be able to get all user polls', async () => {
    const body = {
      options: ['opt1', 'opt2'],
      question: 'question question?',
    };

    const newPool = await request(app.getHttpServer()).post('/poll').send(body);

    const polls = await request(app.getHttpServer())
      .get('/polls')
      .set('Cookie', [newPool.headers['set-cookie'][0].split(';')[0]]);

    expect(polls.body).toHaveLength(2);
  });

  it('should get an empty array when there is no cookie', async () => {
    const pollsError = await request(app.getHttpServer()).get('/polls');
    expect(pollsError.body.message).toEqual('User not found');
  });
});

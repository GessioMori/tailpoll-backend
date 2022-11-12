import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { mockPrisma, uuid3 } from '../../test/utils/prismaMock';
import { PrismaService } from '../services/prisma.service';
import { VoteService } from '../services/vote.service';
import { VoteController } from './vote.controller';

describe('Pool controller', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [VoteController],
      providers: [VoteService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser(process.env.COOKIE_SECRET));
    await app.init();
  });

  afterAll(() => setTimeout(() => process.exit(), 1000));

  it('should create a new vote', async () => {
    const body = {
      option: 1,
    };

    const newVote = await request(app.getHttpServer())
      .post('/vote/' + uuid3)
      .send(body);

    expect(newVote.status).toBe(201);
  });

  it('should be able to get the vote', async () => {
    const body = {
      option: 1,
    };

    const newVote = await request(app.getHttpServer())
      .post('/vote/' + uuid3)
      .send(body);

    const vote = await request(app.getHttpServer())
      .get('/vote/' + uuid3)
      .set('Cookie', [newVote.headers['set-cookie'][0].split(';')[0]]);

    expect(vote.body.option).toEqual(newVote.body.option);
  });
});

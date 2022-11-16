import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PoolController } from './controllers/poll.controller';
import { VoteController } from './controllers/vote.controller';
import { PoolService } from './services/poll.service';
import { PrismaService } from './services/prisma.service';
import { VoteService } from './services/vote.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ThrottlerModule.forRoot({
      ttl: 30,
      limit: 10,
    }),
  ],
  controllers: [PoolController, VoteController],
  providers: [
    PoolService,
    VoteService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

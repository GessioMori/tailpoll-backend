import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PoolController } from './controllers/pool.controller';
import { VoteController } from './controllers/vote.controller';
import { PoolService } from './services/pool.service';
import { PrismaService } from './services/prisma.service';
import { VoteService } from './services/vote.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [PoolController, VoteController],
  providers: [PoolService, VoteService, PrismaService],
})
export class AppModule {}

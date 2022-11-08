import { Module } from '@nestjs/common';
import { PoolController } from './controllers/pool.controller';
import { PoolService } from './services/pool.service';
import { PrismaService } from './services/prisma.service';

@Module({
  imports: [],
  controllers: [PoolController],
  providers: [PoolService, PrismaService],
})
export class AppModule {}

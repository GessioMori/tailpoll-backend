import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PoolController } from './controllers/pool.controller';
import { PoolService } from './services/pool.service';
import { PrismaService } from './services/prisma.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [PoolController],
  providers: [PoolService, PrismaService],
})
export class AppModule {}

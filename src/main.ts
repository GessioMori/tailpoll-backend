import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.enableCors({ origin: process.env.FRONTEND_URL, credentials: true });
  await app.listen(3000);
}
bootstrap();

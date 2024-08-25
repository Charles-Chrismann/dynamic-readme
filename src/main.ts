import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useBodyParser('json', { limit: '100mb' });
  app.enableCors()
  await app.listen(process.env.APP_PORT);
  console.log(`Application is running on: ${await app.getUrl()}`)
}
bootstrap();

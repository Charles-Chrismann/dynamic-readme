import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: process.env.NODE_ENV === "development"
      ? ['log', 'debug', 'verbose', 'warn', 'error', 'fatal']
      : ['log', 'warn', 'error', 'fatal']
  });
  app.useBodyParser('json', { limit: '100mb' });

  app.setBaseViewsDir('./views');
  app.setViewEngine('hbs');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.use(cookieParser());

  app.enableCors()
  await app.listen(process.env.APP_PORT!);
  console.log(`Application is running on: ${await app.getUrl()}`)
}
bootstrap();

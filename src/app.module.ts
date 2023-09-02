import { join } from 'path';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GamesModule } from './games/games.module';
import { ReadmeModule } from './readme/readme.module';
import { TriggerModule } from './trigger/trigger.module';
import { ReadmeService } from './readme/readme.service';
import { RequestModule } from './request/request.module';
import { FirebaseModule } from './firebase/firebase.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    GamesModule,
    ReadmeModule,
    TriggerModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'public'),
    }),
    RequestModule,
    FirebaseModule
  ],
  controllers: [AppController],
  providers: [AppService, ReadmeService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GamesModule } from './games/games.module';
import { ReadmeModule } from './readme/readme.module';
import { ConfigModule } from '@nestjs/config';
import { TriggerModule } from './trigger/trigger.module';
import { ReadmeService } from './readme/readme.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    GamesModule,
    ReadmeModule,
    TriggerModule
  ],
  controllers: [AppController],
  providers: [AppService, ReadmeService],
})
export class AppModule {}

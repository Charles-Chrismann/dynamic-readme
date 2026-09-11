import * as fs from 'fs/promises'
import { join } from 'path';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GamesModule } from './games/games.module';
import { TriggerModule } from './trigger/trigger.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import State from './State';
import { ConfigSchema } from './zod.zodobject';
import { AppConfigService, RequestService } from './services';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    ScheduleModule.forRoot(),
    GamesModule,
    TriggerModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    // AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppConfigService,
  ],
})
export class AppModule implements OnModuleInit {

  private readonly logger = new Logger(AppModule.name);

  async onModuleInit() {
    let config = await State.getConfigOrDefaultOrNull()
    if(!config) {
      this.logger.log('App starting with no configuration, Sate.render method will fail if no configuration set.')
      return
    }
    console.log(config)
    State.init(config)
  }
}

import * as fs from 'fs/promises'
import { join } from 'path';
import { Module, OnModuleInit } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GamesModule } from './games/games.module';
import { TriggerModule } from './trigger/trigger.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from './redis/redis.module';
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
      load: [
        async () => {
          const unsafe_config = JSON.parse((await fs.readFile('./config.json')).toString())
          const config = ConfigSchema.parse(unsafe_config)
          return { config }
        }
      ]
    }),
    ScheduleModule.forRoot(),
    GamesModule,
    TriggerModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    RedisModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppConfigService,
  ],
})
export class AppModule implements OnModuleInit {
  async onModuleInit() {
    await Promise.all([
      RequestService.init(),
      State.init(),
    ])
  }
}

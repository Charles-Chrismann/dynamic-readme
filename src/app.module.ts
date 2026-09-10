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
      // load: [
      //   async () => {
      //     console.log(1)
      //     const [customConfig, defaultConfig] = await Promise.allSettled([
      //       fs.readFile('./config/datas/config.json', 'utf-8'),
      //       fs.readFile('./config/datas/config.default.json', 'utf-8'),
      //     ])

      //     let conf = customConfig.status === 'fulfilled' ? customConfig.value
      //       : defaultConfig.status === 'fulfilled' ? defaultConfig.value : null

      //     if(!conf) throw new Error(`No custom configuration provided, no default configuration available`)
          
          
      //     const unsafe_config = JSON.parse(conf)
      //     console.log(2)
      //     const config = ConfigSchema.parse(unsafe_config)
      //     console.log(config)
      //     return { config }
      //   }
      // ]
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
    const [customConfig, defaultConfig] = await Promise.allSettled([
      fs.readFile('./config/datas/config.json', 'utf-8'),
      fs.readFile('./config/datas/config.default.json', 'utf-8'),
    ])
    let conf = customConfig.status === 'fulfilled' ? customConfig.value
      : defaultConfig.status === 'fulfilled' ? defaultConfig.value : null
      
    if(!conf) {
      this.logger.log('App starting with no configuration, Sate.render method will fail if no configuration set.')
      return
    }
    const config = JSON.parse(conf)
    console.log(config)
    State.init(config)
  }
}

import { ConfigService } from '@nestjs/config'
import { Injectable } from '@nestjs/common'
import { RedisService } from '../redis/redis.service'

@Injectable()
export class AppConfigService {
  public static instance: ConfigService
  public static redis: RedisService
  public static APP_BASE_URL: string

  constructor(
    public readonly configService: ConfigService,
    public readonly redis: RedisService
  ) {
    AppConfigService.instance = configService
    AppConfigService.redis = redis
    AppConfigService.APP_BASE_URL = AppConfigService.getOrThrow("APP_BASE_URL")
  }

  static get<T = any>(key: string): T {
    if (!AppConfigService.instance) {
      throw new Error('ConfigService not initialized yet')
    }
    return AppConfigService.instance.get<T>(key)
  }

  static getOrThrow<T = any>(key: string): T {
    if (!AppConfigService.instance) {
      throw new Error('ConfigService not initialized yet')
    }
    return AppConfigService.instance.getOrThrow<T>(key)
  }
}

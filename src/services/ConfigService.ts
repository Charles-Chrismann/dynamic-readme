import { ConfigService } from '@nestjs/config'
import { Injectable } from '@nestjs/common'

@Injectable()
export class AppConfigService {
  public static instance: ConfigService
  public static APP_BASE_URL: string

  constructor(
    public readonly configService: ConfigService,
  ) {
    AppConfigService.instance = configService
    AppConfigService.APP_BASE_URL = AppConfigService.getOrThrow("APP_BASE_URL")
  }

  static get<T = any>(key: string): T {
    if (!AppConfigService.instance) {
      throw new Error('ConfigService not initialized yet')
    }
    return AppConfigService.instance.getOrThrow<T>(key)
  }

  static getOrThrow<T = any>(key: string): T {
    if (!AppConfigService.instance) {
      throw new Error('ConfigService not initialized yet')
    }
    return AppConfigService.instance.getOrThrow<T>(key)
  }
}

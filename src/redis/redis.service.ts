import { Injectable } from '@nestjs/common';
import { RedisClientType, createClient } from 'redis';

@Injectable()
export class RedisService {
  public client: RedisClientType;
  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL
    });
    (async () => {
      await this.client.connect();
      console.log(await this.client.ping())
    })()
  }
}

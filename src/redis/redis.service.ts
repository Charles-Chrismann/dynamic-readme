import { Injectable, Logger } from '@nestjs/common';
import { RedisClientType, createClient } from 'redis';

@Injectable()
export class RedisService {
  public client: RedisClientType;
  private readonly logger = new Logger('DB')
  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL
    });
    (async () => {
      await this.client.connect();
      if(await this.client.ping() === 'PONG') this.logger.log('Connection established to the database')
    })()
  }
}

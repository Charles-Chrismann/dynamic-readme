import { Module } from '@nestjs/common';
import { RequestService } from './request.service';
import { ConfigService } from 'src/config/config.service';

@Module({
  providers: [RequestService, ConfigService],
  exports: [RequestService]
})
export class RequestModule {}

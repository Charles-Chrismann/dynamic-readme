import { Module } from '@nestjs/common';
import { TriggerController } from './trigger.controller';
import { ReadmeModule } from 'src/readme/readme.module';
import { RequestModule } from 'src/request/request.module';

@Module({
  imports: [ReadmeModule, RequestModule],
  controllers: [TriggerController],
})
export class TriggerModule {}

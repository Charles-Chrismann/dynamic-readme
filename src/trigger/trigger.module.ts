import { Module } from '@nestjs/common';
import { TriggerController } from './trigger.controller';

@Module({
  controllers: [TriggerController]
})
export class TriggerModule {}

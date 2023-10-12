import { Module } from '@nestjs/common';
import { GameboyService } from './gameboy.service';
import { GameboyController } from './gameboy.controller';

@Module({
  providers: [GameboyService],
  controllers: [GameboyController]
})
export class GameboyModule {}

import { Module } from '@nestjs/common';
import { GameboyService } from './gameboy.service';
import { GameboyController } from './gameboy.controller';
import { GameboyGateway } from './gameboy.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [GameboyService, GameboyGateway],
  controllers: [GameboyController]
})
export class GameboyModule {}

import { Module, forwardRef } from '@nestjs/common';
import { MinesweeperService } from './minesweeper/minesweeper.service';
import { MinesweeperController } from './minesweeper/minesweeper.controller';
import { ChessService } from './chess/chess.service';
import { ChessController } from './chess/chess.controller';
import { ReadmeModule } from 'src/readme/readme.module';
import { WordleService } from './wordle/wordle.service';
import { WordleController } from './wordle/wordle.controller';
import { RedisModule } from 'src/redis/redis.module';
import { GameboyController } from './gameboy/gameboy.controller';
import { GameboyService } from './gameboy/gameboy.service';
import { GameboyGateway } from './gameboy/gameboy.gateway';
import { AuthModule } from 'src/auth/auth.module';

import { GbaService } from './gba/gba.service';
import { GbaController } from './gba/gba.controller';

@Module({
  imports: [forwardRef(() => ReadmeModule), RedisModule, AuthModule],
  controllers: [MinesweeperController, ChessController, WordleController, GameboyController, GbaController],
  providers: [MinesweeperService, ChessService, WordleService, GameboyService, GameboyGateway, GbaService],
  exports: [MinesweeperService, ChessService, WordleService, GameboyService, GbaService]
})
export class GamesModule {}

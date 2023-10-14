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

@Module({
  imports: [forwardRef(() => ReadmeModule), RedisModule],
  controllers: [MinesweeperController, ChessController, WordleController, GameboyController],
  providers: [MinesweeperService, ChessService, WordleService, GameboyService, GameboyGateway],
  exports: [MinesweeperService, ChessService, WordleService, GameboyService]
})
export class GamesModule {}

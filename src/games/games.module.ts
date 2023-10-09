import { Module, forwardRef } from '@nestjs/common';
import { MinesweeperService } from './minesweeper/minesweeper.service';
import { MinesweeperController } from './minesweeper/minesweeper.controller';
import { ChessService } from './chess/chess.service';
import { ChessController } from './chess/chess.controller';
import { ReadmeModule } from 'src/readme/readme.module';
import { WordleService } from './wordle/wordle.service';
import { WordleController } from './wordle/wordle.controller';
import { SudokuModule } from './sudoku/sudoku.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [forwardRef(() => ReadmeModule), SudokuModule, RedisModule],
  controllers: [MinesweeperController, ChessController, WordleController],
  providers: [MinesweeperService, ChessService, WordleService],
  exports: [MinesweeperService, ChessService, WordleService]
})
export class GamesModule {}

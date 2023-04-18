import { Module } from '@nestjs/common';
import { MinesweeperService } from './minesweeper/minesweeper.service';
import { MinesweeperController } from './minesweeper/minesweeper.controller';
import { ReadmeService } from 'src/readme/readme.service';
import { ChessService } from './chess/chess.service';
import { ChessController } from './chess/chess.controller';

@Module({
  controllers: [MinesweeperController, ChessController],
  providers: [MinesweeperService, ReadmeService, ChessService],
  exports: [MinesweeperService, ChessService]
})
export class GamesModule {}

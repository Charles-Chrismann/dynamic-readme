import { Module } from '@nestjs/common';
import { MinesweeperService } from './minesweeper/minesweeper.service';
import { MinesweeperController } from './minesweeper/minesweeper.controller';
import { ReadmeService } from 'src/readme/readme.service';
import { ChessService } from './chess/chess.service';
import { ChessController } from './chess/chess.controller';
import { RequestService } from 'src/request/request.service';

@Module({
  controllers: [MinesweeperController, ChessController],
  providers: [MinesweeperService, ReadmeService, ChessService, RequestService],
  exports: [MinesweeperService, ChessService]
})
export class GamesModule {}

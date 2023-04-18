import { Module } from '@nestjs/common';
import { ReadmeService } from './readme.service';
import { MinesweeperService } from 'src/games/minesweeper/minesweeper.service';
import { ChessService } from 'src/games/chess/chess.service';

@Module({
  providers: [ReadmeService, MinesweeperService, ChessService]
})
export class ReadmeModule {}

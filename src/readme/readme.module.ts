import { Module } from '@nestjs/common';
import { ReadmeService } from './readme.service';
import { MinesweeperService } from 'src/games/minesweeper/minesweeper.service';
import { ChessService } from 'src/games/chess/chess.service';
import { RequestService } from 'src/request/request.service';

@Module({
  providers: [ReadmeService, RequestService, MinesweeperService, ChessService]
})
export class ReadmeModule {}

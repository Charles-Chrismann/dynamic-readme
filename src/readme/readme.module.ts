import { Module } from '@nestjs/common';
import { ReadmeService } from './readme.service';
import { MinesweeperService } from 'src/games/minesweeper/minesweeper.service';

@Module({
  providers: [ReadmeService, MinesweeperService]
})
export class ReadmeModule {}

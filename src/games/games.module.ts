import { Module } from '@nestjs/common';
import { MinesweeperService } from './minesweeper/minesweeper.service';
import { MinesweeperController } from './minesweeper/minesweeper.controller';
import { ReadmeService } from 'src/readme/readme.service';

@Module({
  controllers: [MinesweeperController],
  providers: [MinesweeperService, ReadmeService],
  exports: [MinesweeperService]
})
export class GamesModule {}

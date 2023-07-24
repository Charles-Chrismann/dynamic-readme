import { Module, forwardRef } from '@nestjs/common';
import { MinesweeperService } from './minesweeper/minesweeper.service';
import { MinesweeperController } from './minesweeper/minesweeper.controller';
import { ChessService } from './chess/chess.service';
import { ChessController } from './chess/chess.controller';
import { ReadmeModule } from 'src/readme/readme.module';

@Module({
  imports: [forwardRef(() => ReadmeModule)],
  controllers: [MinesweeperController, ChessController],
  providers: [MinesweeperService, ChessService],
  exports: [MinesweeperService, ChessService]
})
export class GamesModule {}

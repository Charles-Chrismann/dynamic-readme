import { Module } from '@nestjs/common';
import { SudokuService } from './sudoku.service';
import { SudokuController } from './sudoku.controller';
import { ReadmeModule } from 'src/readme/readme.module';

@Module({
  providers: [SudokuService],
  controllers: [SudokuController],
  imports: [ReadmeModule]
})
export class SudokuModule {}

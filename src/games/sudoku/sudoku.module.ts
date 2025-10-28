import { Module } from '@nestjs/common';
import { SudokuService } from './sudoku.service';
import { SudokuController } from './sudoku.controller';

@Module({
  providers: [SudokuService],
  controllers: [SudokuController]
})
export class SudokuModule {}

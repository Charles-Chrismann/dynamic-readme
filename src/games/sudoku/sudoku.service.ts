import { Injectable } from '@nestjs/common';

@Injectable()
export class SudokuService {
    new() {
        console.log('New sudoku')
    }
}

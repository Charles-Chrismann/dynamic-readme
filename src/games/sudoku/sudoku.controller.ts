import { Controller, Get, Res } from '@nestjs/common';
import { SudokuService } from './sudoku.service';
import { ReadmeService } from 'src/readme/readme.service';

import * as config from '../../../config.json';
import { Response } from 'express';

@Controller('sudoku')
export class SudokuController {
    constructor(private sudokuService: SudokuService, private readmeService: ReadmeService) {}

    @Get('new')
    new(@Res() res: Response) {
        this.sudokuService.new()
        // await this.readmeService.commit(':1234: Reset sudoku')
        res.status(200)
        res.redirect(config.datas.repo.url + '#a-classic-sudoku')
    }

    @Get('number')
    number(@Res() res: Response) {
        this.sudokuService.new()
        // await this.readmeService.commit(':1234: Update sudoku')
        res.status(200)
        res.redirect(config.datas.repo.url + '#a-classic-sudoku')
    }
}

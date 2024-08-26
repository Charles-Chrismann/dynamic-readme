import { Controller, Get, Res } from '@nestjs/common';
import { SudokuService } from './sudoku.service';
import { Response } from 'express';
import { ConfigService } from 'src/config/config.service';

@Controller('sudoku')
export class SudokuController {
    constructor(
      private configService: ConfigService,
      private sudokuService: SudokuService
    ) {}

    @Get('new')
    new(@Res() res: Response) {
      const {config} = this.configService
      this.sudokuService.new()
      // await this.readmeService.commit(':1234: Reset sudoku')
      res.status(200)
      res.redirect(config.datas.repo.url + '#a-classic-sudoku')
    }

    @Get('number')
    number(@Res() res: Response) {
      const {config} = this.configService
      this.sudokuService.new()
      // await this.readmeService.commit(':1234: Update sudoku')
      res.status(200)
      res.redirect(config.datas.repo.url + '#a-classic-sudoku')
    }
}

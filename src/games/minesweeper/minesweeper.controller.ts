import { Controller, Get, Query, Redirect, Res } from '@nestjs/common';

import * as config from '../../../config.json';
import { MinesweeperService } from './minesweeper.service';
import { ReadmeService } from 'src/readme/readme.service';
import { Response } from 'express';

@Controller('minesweeper')
export class MinesweeperController {
    constructor(private minesweeperService: MinesweeperService, private readmeService: ReadmeService) {}
    @Get('new')
    async new(@Res() res: Response) {
        this.minesweeperService.new()
        await this.readmeService.commit()
        res.status(200)
        res.redirect(config.datas.repo.url + '#a-classic-minesweeper')
    }

    @Get('click')
    async click(@Query('x') x: string, @Query('y') y: string, @Res() res: Response){
        this.minesweeperService.click(+x, +y)
        await this.readmeService.commit()
        res.status(200)
        res.redirect(config.datas.repo.url + '#a-classic-minesweeper')
    }
}
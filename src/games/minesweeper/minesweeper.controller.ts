import { Controller, Get, Query, Redirect } from '@nestjs/common';

import * as config from '../../../config.json';
import { MinesweeperService } from './minesweeper.service';
import { ReadmeService } from 'src/readme/readme.service';

@Controller('minesweeper')
export class MinesweeperController {
    constructor(private minesweeperService: MinesweeperService, private readmeService: ReadmeService) {}
    @Get('new')
    @Redirect(config.datas.repo.url + '#a-classic-minesweeper', 302)
    async new(): Promise<string> {
        this.minesweeperService.new()
        await this.readmeService.commit()
        return 'new'
    }

    @Get('click')
    @Redirect(config.datas.repo.url + '#a-classic-minesweeper', 302)
    async click(@Query('x') x: string, @Query('y') y: string): Promise<string> {
        this.minesweeperService.click(+x, +y)
        await this.readmeService.commit()
        return 'click'
    }
}

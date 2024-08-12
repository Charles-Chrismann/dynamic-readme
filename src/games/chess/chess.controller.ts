import { Controller, Get, Request, Res } from '@nestjs/common';
import { ChessService } from './chess.service';
import { Response } from 'express'
import * as config from '../../../config.json';
import { ReadmeService } from 'src/readme/readme.service';

@Controller('chess')
export class ChessController {
    constructor(private chessService: ChessService, private readmeService: ReadmeService) {}
    @Get('new')
    async new(@Res() res: Response) {
        this.chessService.new()
        await this.readmeService.commit(':chess_pawn: Reset chess')
        res.status(200)
        res.redirect(config.datas.repo.url + '#a-classic-chess')
    }

    @Get('move')
    async move(@Res() res: Response, @Request() req) {
        if(this.chessService.move(req)) await this.readmeService.commit(':chess_pawn: Update chess')
        res.status(200)
        res.redirect(config.datas.repo.url + '#a-classic-chess')
    }
}

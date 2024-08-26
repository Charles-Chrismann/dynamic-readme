import { Controller, Get, Request, Res } from '@nestjs/common';
import { ChessService } from './chess.service';
import { Response } from 'express'
import { ReadmeService } from 'src/readme/readme.service';
import { ConfigService } from 'src/config/config.service';

@Controller('chess')
export class ChessController {
    constructor(
      private configService: ConfigService,
      private chessService: ChessService,
      private readmeService: ReadmeService
    ) {}
    @Get('new')
    async new(@Res() res: Response) {
      const {config} = this.configService
      this.chessService.new()
      await this.readmeService.commit(':chess_pawn: Reset chess')
      res.status(200)
      res.redirect(config.datas.repo.url + '#a-classic-chess')
    }

    @Get('move')
    async move(@Res() res: Response, @Request() req) {
      const {config} = this.configService
      if(this.chessService.move(req)) await this.readmeService.commit(':chess_pawn: Update chess')
      res.status(200)
      res.redirect(config.datas.repo.url + '#a-classic-chess')
    }
}

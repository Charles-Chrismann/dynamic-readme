import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  Res
} from '@nestjs/common';
import { ChessService } from './chess.service';
import { Response } from 'express'
import { ChessCoordinates } from './declarations';

@Controller('chess')
export class ChessController {
  constructor(
    private chessService: ChessService
  ) { }
  @Get(':id/new')
  async new(
    @Param('id') id: string,
    @Res() res: Response
  ) {
    return this.chessService.new(id, res)
  }

  @Get(':id/move')
  async move(
    @Param('id') id: string,
    @Query('from') from: ChessCoordinates,
    @Query('to') to: ChessCoordinates,
    @Res() res: Response,
  ) {
    return this.chessService.move(id, { from, to }, res)  
  }

  @Get(':id/board')
  @Header('Content-Type', 'image/png')
  @Header('Cache-Control', 'public, max-age=0')
  board(
    @Param('id') id: string,
    @Res() res: Response
  ) {
    return this.chessService.board(id, res)
  }
}

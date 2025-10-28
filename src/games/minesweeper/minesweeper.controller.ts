import { Controller,
  Get,
  Header,
  Param,
  Query,
  Res
} from '@nestjs/common';
import { Response } from 'express';
import { MinesweeperService } from './minesweeper.service';

@Controller('minesweeper')
export class MinesweeperController {
  constructor(
    private minesweeperService: MinesweeperService
  ) {}
  @Get(':id/new')
  async new(
    @Param('id') id: string,
    @Res() res: Response
  ) {
    return this.minesweeperService.new(id, res)
  }

  @Get(':id/click')
  async click(
    @Param('id') id: string,
    @Query('x') x: string,
    @Query('y') y: string,
    @Res() res: Response
  ){
    return this.minesweeperService.click(id, +x, +y, res)
  }

  @Get(':id/gif')
  @Header('Cache-Control', 'public, max-age=0')
  @Header('Content-Type', 'image/gif')
  async gif(
    @Param('id') id: string,
    @Res() res: Response
  ){
    return this.minesweeperService.gif(id, res)
  }
}
import { Response } from 'express';
import {
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { GbaService } from './gba.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('gba')
export class GbaController {

  constructor(
    private gbaService: GbaService,
  ){}

  @Get(':id/input')
  input(
    @Param('id') id: string,
    @Query('input') input: string,
    @Res() res: Response,
  ) {
    return this.gbaService.input(id, +input, res)
  }

  @Get(':id/save')
  async save(
    @Param() id: string,
    @Res() res: Response
  ) {
    return await this.gbaService.save(id, res)
  }

  @Post(':id/load')
  @UseInterceptors(FileInterceptor('file'))
  async load(
    @Param('id') id: string,
    @UploadedFile() file: any,
  ) {
    return await this.gbaService.load(id, file)
  }

  @Get('/:id/gif')
  @Header('Cache-Control', 'public, max-age=0')
  @Header('Content-Type', 'image/gif')
  gif(
    @Param('id') id: string
  ) {
    return this.gbaService.gif(id)
  }
}

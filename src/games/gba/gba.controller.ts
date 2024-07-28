import { Body, Controller, Get, Param, Post, Query, RawBodyRequest, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import * as config from '../../../config.json';
import { GbaService } from './gba.service';
import * as rawbody from 'raw-body';

@Controller('gba')
export class GbaController {

  constructor(private gbaService: GbaService){}

  @Get('/input')
  input(@Query('input') input: string, @Res() res: Response) {
    if(input) this.gbaService.input(+input)
    res.status(200)
    res.redirect(config.datas.perso.homepage)
  }

  @Get('/save')
  async save(@Res() res: Response) {
    return await this.gbaService.save(res)
  }

  @Post('/load')
  async load(@Req() req: Request) {
    const save = (await rawbody(req)).toString().trim()
    this.gbaService.load(save)
  }

  @Get('/doframe')
  frame(@Res() res: Response) {
    return this.gbaService.frame(res)
  }

  @Get('/dogif')
  gif(@Res() res: Response) {
    if(!this.gbaService.lastInputFrames.length) return this.gbaService.frame(res)
    return this.gbaService.gif(res)
  }
}

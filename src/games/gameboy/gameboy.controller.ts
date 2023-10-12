import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import * as config from '../../../config.json';
import { GameboyService } from './gameboy.service';

@Controller('gameboy')
export class GameboyController {

  constructor(private gameboyService: GameboyService){}

  @Get('/input')
  input(@Query('input') input: string, @Res() res: Response) {
    if(input) this.gameboyService.input(input)
    res.status(200)
    res.redirect(config.datas.repo.url + '#github-plays-pokemon-')
  }

  @Get('/save')
  save() {
    return this.gameboyService.save()
  }

  @Post('/load')
  load(@Body('save') save) {
    console.log('load')
    this.gameboyService.load(save)
  }

  @Get('/frame')
  frame(@Res() res: Response) {
    return this.gameboyService.frame(res)
  }
}

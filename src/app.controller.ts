import { BadRequestException, Body, Controller, Get, Headers, Post, Query, Render, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import State from './State';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService
  ) {}

  @Get('config')
  @Render('config')
  config(
    @Query('t') token: string
  ) {
    console.log('abc')
    if(!token || this.configService.getOrThrow('GH_ACTION_TRUST') !== token) throw new BadRequestException()
    console.log('abc', token)
    return this.appService.config(token)
  }

  @Post('config')
  async updateConfig(
    @Headers('token') token: string,
    @Body('config') config: string,
  ) {
    if(!token || this.configService.getOrThrow('GH_ACTION_TRUST') !== token) throw new BadRequestException()
    await State.setConfig(JSON.parse(config))
    return
  }

  @Get('config/export')
  exportConfig(
    @Query('t') token: string,
    @Res() res: Response,
  ) {
    if(!token || this.configService.getOrThrow('GH_ACTION_TRUST') !== token) throw new BadRequestException()
    State.exportConfig(res)
  }

  @Post('config/import')
  @UseInterceptors(FileInterceptor('file'))
  async importConfig(
    @UploadedFile() file: any,
    @Query('t') token: string,
  ) {
    if(!token || this.configService.getOrThrow('GH_ACTION_TRUST') !== token) throw new BadRequestException()
    await State.importConfig(file)
  }

  @Get('render')
  render() {
    return this.appService.render()
  }
}

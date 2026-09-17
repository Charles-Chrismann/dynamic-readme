import { BadRequestException, Body, Controller, Get, Headers, Post, Query, Render, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import State from './State';
import { ConfigService } from '@nestjs/config';
import type { Response, Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsNotEmpty, IsString } from 'class-validator';
import { AuthGuard } from './guards/auth.guard';

class PostLoginDto {
  @IsString()
  @IsNotEmpty()
  token!: string
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService
  ) {}

  @Get('login')
  @Render('login')
  login() {}

  @Post('config/login')
  postConfigLogin(
    @Body() body: PostLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token } = body
    if(this.configService.getOrThrow('API_AUTH_TOKEN') !== token) throw new BadRequestException()
    res.cookie('auth_token', body.token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    })
  }

  @Get('config')
  @UseGuards(AuthGuard)
  @Render('config')
  config() {
    return this.appService.config()
  }

  @Post('config')
  @UseGuards(AuthGuard)
  async updateConfig(
    @Body('config') config: Record<string, any>,
  ) {
    await State.setConfig(config)
    return
  }

  @Get('config/export')
  @UseGuards(AuthGuard)
  exportConfig(
    @Res() res: Response,
  ) {
    State.exportConfig(res)
  }

  @Post('config/import')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async importConfig(
    @UploadedFile() file: Express.Multer.File,
  ) {
    await State.importConfig(file)
  }

  @Get('render')
  render() {
    return this.appService.render()
  }
}

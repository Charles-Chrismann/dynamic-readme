import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { WordleService } from './wordle.service';
import { Request, Response } from 'express';
import * as config from 'config.json';
import { ReadmeService } from 'src/readme/readme.service';
import { Cron } from '@nestjs/schedule';

@Controller('wordle')
export class WordleController {
    constructor(private readonly wordleService: WordleService, private readonly readmeService: ReadmeService) {}

    @Get('wordle')
    async wordle() {
        await this.wordleService.wordle();
        await this.readmeService.commit(':book: set today\'s wordle')
        return 'wordle';
    }

    @Cron('0 0 22 * * *')
    async wordleAndCommit() {
        await this.wordle();
    }

    @Post('guess')
    async guess(
        @Res() res: Response,
        @Body('guess') guess: string,
        @Body('GH_ACTION_TRUST') GH_ACTION_TRUST: string,
        @Body('issuer') issuer: string,
        @Body('issuerId') issuerId: number,
        @Req() req: Request
    ) {
        if(GH_ACTION_TRUST !== process.env.GH_ACTION_TRUST) throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
        if(!guess || guess.length !== 5) throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
        if(!issuer) throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
        if(!issuerId) throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
        console.log('passed')

        await this.wordleService.guess(guess, issuer, issuerId);
        await this.readmeService.commit(':book: Update wordle')
        res.redirect(200, config.datas.repo.url + "#a-classic-wordle");
    }
}

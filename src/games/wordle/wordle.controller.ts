import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { WordleService } from './wordle.service';
import { Response } from 'express';
import * as config from 'config.json';
import { ReadmeService } from 'src/readme/readme.service';

@Controller('wordle')
export class WordleController {
    constructor(private readonly wordleService: WordleService, private readonly readmeService: ReadmeService) {}

    @Get('wordle')
    async wordle() {
        await this.wordleService.wordle();
        return 'wordle';
    }

    @Post('guess')
    async guess(@Res() res: Response, @Body('guess') guess: string, @Body('GH_ACTION_TRUST') GH_ACTION_TRUST: string, @Body('issuer') issuer: string) {
        if(GH_ACTION_TRUST !== process.env.GH_ACTION_TRUST) return
        if(!guess || guess.length !== 5) return
        if(!issuer) return
        
        await this.wordleService.guess(guess, issuer);
        // await this.readmeService.commit()
        res.redirect(200, config.datas.repo.url + "#a-classic-wordle");
    }
}

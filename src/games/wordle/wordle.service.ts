import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { WordleDynamicModule } from 'src/modules';
import State from 'src/State';
import { ReadmeService } from 'src/services';
import { Response } from 'express';

@Injectable()
export class WordleService {

  async guess(
    GH_ACTION_TRUST: string,
    guess: string,
    issuer: string,
    issuerId: number,
    res: Response
  ) {

    if(GH_ACTION_TRUST !== process.env.GH_ACTION_TRUST) throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    if(!guess || guess.length !== 5) throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    if(!issuer) throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    if(!issuerId) throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    console.log('passed')
    
    const module = State.modules.find(
      m => m instanceof WordleDynamicModule
    )

    await module.guess(guess, issuer, issuerId);

    await ReadmeService.updateReadmeAndRedirect(':book: Update wordle', res, "#a-classic-wordle")
  }
}

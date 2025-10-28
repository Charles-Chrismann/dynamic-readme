import { Body,
  Controller,
  Post,
  Res
} from '@nestjs/common';
import { WordleService } from './wordle.service';
import { Response } from 'express';

@Controller('wordle')
export class WordleController {
  constructor(
    private readonly wordleService: WordleService
  ) {}

  @Post('guess')
  async guess(
    @Res() res: Response,
    @Body('guess') guess: string,
    @Body('GH_ACTION_TRUST') GH_ACTION_TRUST: string,
    @Body('issuer') issuer: string,
    @Body('issuerId') issuerId: number
  ) {

    return this.wordleService.guess(
      GH_ACTION_TRUST,
      guess,
      issuer,
      issuerId,
      res
    )
  }
}

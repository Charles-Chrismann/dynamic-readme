import { Module } from '@nestjs/common';
import { WordleService } from './wordle.service';
import { WordleController } from './wordle.controller';

@Module({
  providers: [WordleService],
  controllers: [WordleController]
})
export class WordleModule {}

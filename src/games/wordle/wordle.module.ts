import { Module } from '@nestjs/common';
import { WordleService } from './wordle.service';
import { WordleController } from './wordle.controller';
import { ReadmeModule } from 'src/readme/readme.module';

@Module({
  imports: [ReadmeModule],
  providers: [WordleService],
  controllers: [WordleController]
})
export class WordleModule {}

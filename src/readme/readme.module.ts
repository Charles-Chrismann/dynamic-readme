import { Module, forwardRef } from '@nestjs/common';
import { ReadmeService } from './readme.service';
import { GamesModule } from 'src/games/games.module';
import { RequestModule } from 'src/request/request.module';

@Module({
  imports: [forwardRef(() => GamesModule), RequestModule],
  providers: [ReadmeService],
  exports: [ReadmeService]
})
export class ReadmeModule {}

import { Module, forwardRef } from '@nestjs/common';
import { ReadmeService } from './readme.service';
import { GamesModule } from 'src/games/games.module';
import { RequestModule } from 'src/request/request.module';
import { ConfigService } from 'src/config/config.service';

@Module({
  imports: [forwardRef(() => GamesModule), RequestModule],
  providers: [ReadmeService, ConfigService],
  exports: [ReadmeService]
})
export class ReadmeModule {}

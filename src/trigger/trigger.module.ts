import { Module } from '@nestjs/common';
import { TriggerController } from './trigger.controller';
import { ReadmeService } from 'src/readme/readme.service';
import { RequestService } from 'src/request/request.service';
import { GamesModule } from 'src/games/games.module';

@Module({
  imports: [GamesModule],
  controllers: [TriggerController],
  providers: [ReadmeService, RequestService],
})
export class TriggerModule {}

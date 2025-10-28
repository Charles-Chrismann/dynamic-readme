import { Module } from '@nestjs/common';
import { GbaService } from './gba.service';
import { GbaController } from './gba.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [GbaService],
  controllers: [GbaController]
})
export class GbaModule {}

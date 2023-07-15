import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ReadmeService } from './readme/readme.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly readmeService: ReadmeService,
    ) {}

  @Get()
  async getHello(): Promise<string> {
    return this.appService.getHello();
  }
}

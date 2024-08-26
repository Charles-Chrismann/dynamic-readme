import { Injectable } from '@nestjs/common';
import Config from 'src/declarations/config.interface';
import * as fs from 'fs'

@Injectable()
export class ConfigService {
  config: Config
  constructor() {
    this.config = JSON.parse(fs.readFileSync('./config.json').toString())
  }
}

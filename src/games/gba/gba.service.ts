import { Readable } from 'stream';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Injectable, StreamableFile } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import State from 'src/State';
import { GbaDynamicModule } from 'src/modules';
import { ReadmeService } from 'src/services';

@Injectable()
export class GbaService {

  constructor(
    private readonly redis: RedisService,
    private configService: ConfigService
  ) {}

  input(id: string, input: number, res: Response) {
    const module: GbaDynamicModule = State.modules.find(m => m.data['uuid'] === id) as GbaDynamicModule
    module.input(input)
    
    ReadmeService.doNothingAndRedirect(res, '#f-zodiac-signs-lets-play-pokemon-together')
  }

  save(id: string, res: Response) {
    const module: GbaDynamicModule = State.modules.find(m => m.data['uuid'] === id) as GbaDynamicModule
    return module.save(res)
  }

  async load(id: string, file: any) {
    const module: GbaDynamicModule = State.modules.find(m => m.data['uuid'] === id) as GbaDynamicModule
    return module.load(file.buffer)
  }

  gif(id: string) {
    const module: GbaDynamicModule = State.modules.find(m => m.data['uuid'] === id) as GbaDynamicModule
    return new StreamableFile(Readable.from(module.gifBuffer));
  }

  async renderInputBoard() {
    let str = `<table align="center">\n  <thead>\n`
    str += '    <tr>\n      <th colspan="4">Game Contributions</th>\n    </tr>\n'
    str += `    <tr>\n      <th>Rank</th>\n      <th colspan="2">Player</th>\n      <th>Inputs</th>\n    </tr>\n  </thead>\n  <tbody>\n`
    const playersIds = await this.redis.client.keys("gameboy:players:*")
    const players = await Promise.all(playersIds.map(player => this.redis.client.hGetAll(player)))
    const users = await Promise.all(players.map(player => this.redis.client.hGetAll(`user:${player.id}`)))
    const rowsDatas = players.map((player, index) => ({...player, ...users[index]})).sort((a, b) => +b.inputCount - +a.inputCount)
    str += rowsDatas.map((row, i) => `    <tr>\n      <td align="center">${i + 1}</td>\n      <td align="center"><a href="https://github.com/${row.login}"><img src="${row.avatar_url}" alt="profil picture" width="40"></img></td>\n      <td align="center"><a href="https://github.com/${row.login}">@${row.login}</a></td>\n      <td align="center">${row.inputCount}</td>\n    </tr>\n`).join('')
    str += `    <tr>\n      <td colspan="4" align="center"><a href="${process.env.APP_PROTOCOL}://${process.env.APP_SUB_DOMAIN}.${process.env.APP_DOMAIN}/client.html">Play with your Github account here !</a></td>\n    </tr>\n`
    str += `  </tbody>\n</table>\n\n`

    return str
  }
}

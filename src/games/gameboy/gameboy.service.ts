import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createCanvas, ImageData } from '@napi-rs/canvas';
import { compress, decompress } from 'compress-json';
import { Response } from 'express';
import { Cron } from '@nestjs/schedule';
import { RedisService } from 'src/redis/redis.service';
import { GifEncoder } from '@skyra/gifenc';
const Gameboy = require('serverboy')

const rom = fs.readFileSync(path.join(process.env.PWD, 'roms', process.env.ROM_NAME))

@Injectable()
export class GameboyService implements OnModuleInit {
  private readonly logger = new Logger(GameboyService.name)

  gameboy_instance: any
  renderInterval: NodeJS.Timer | null
  renderTimeout: NodeJS.Timeout | null
  lastInputFrames: number[][] = []

  constructor(private readonly redis: RedisService) {}

  async onModuleInit() {
    const gi = JSON.parse(await this.redis.client.get('gameboy:instance'))
    if(gi) {
      this.load(gi)
    }
    else {
      this.gameboy_instance = new Gameboy()
      this.gameboy_instance.loadRom(rom)
      this.setRenderSession()
    }
  }

  @Cron(process.env.EMU_BACKUP_CRON)
  async backup() {
    this.logger.log('[SHEDULED] Saving gameboy')
    const save = this.gameboy_instance[Object.keys(this.gameboy_instance)[0]].gameboy.saveState()
    this.redis.client.set('gameboy:instance', JSON.stringify(compress(save)))
  }

  setRenderInterval(frameInterval = 5) {
    this.renderInterval = setInterval(() => {
      this.gameboy_instance.doFrame()
    }, frameInterval)
  }

  stopRenderInterval(intervalId) {
    clearInterval(intervalId)
  }

  setRenderTimeout(intervalId, timeout = 60000) {
    this.renderTimeout = setTimeout(() => this.stopRenderInterval(intervalId), timeout)
  }

  stopRenderTimeout() {
    clearTimeout(this.renderTimeout)
  }

  setRenderSession() {
    this.setRenderInterval()
    this.setRenderTimeout(this.renderInterval)
  }

  stopRenderSession() {
    this.stopRenderInterval(this.renderInterval)
    this.stopRenderTimeout()
  }

  skipFrames(n) {
    const frames = []
    for(let i = 0; i < n; i++) {
      if(i % 4 === 0) frames.push(this.gameboy_instance.doFrame())
      else this.gameboy_instance.doFrame()
    }
    return frames
  }

  async frame(res: Response) {
    const canvas = createCanvas(160, 144)
    const ctx = canvas.getContext('2d')
    let ctx_data = ctx.createImageData(160, 144);

    const screen = this.gameboy_instance.doFrame()

    for (let i=0; i < screen.length; i++){
      ctx_data.data[i] = screen[i];
    }

    ctx.putImageData(ctx_data, 0, 0);

    const stream = Readable.from(await canvas.encode('png'))
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=0')
    stream.pipe(res)
  }

  gif(res: Response) {
    res.setHeader('Content-Type', 'image/gif')
    res.setHeader('Cache-Control', 'public, max-age=0')

    const gifEncoder = new GifEncoder(160, 144)
    .setRepeat(-1)
    .setDelay(64)
    .setQuality(10);
    gifEncoder.createWriteStream().pipe(res)
    gifEncoder.start()
    const canvas = createCanvas(160, 144)
    const ctx = canvas.getContext('2d')
    let ctx_data = ctx.createImageData(160, 144);
    for(let i = 0; i < this.lastInputFrames.length; i++) {
      for (let j=0; j < this.lastInputFrames[i].length; j++){
        ctx_data.data[j] = this.lastInputFrames[i][j];
      }
      ctx.putImageData(ctx_data, 0, 0);
      gifEncoder.addFrame(ctx)
    }
    gifEncoder.finish();
  }

  input(input: string) {
    this.stopRenderSession()
    this.lastInputFrames = []

    for(let i = 0; i < 5; i++) {
      this.gameboy_instance.pressKey(input)
      this.lastInputFrames.push(this.gameboy_instance.doFrame())
    }

    this.lastInputFrames = this.lastInputFrames.concat(this.skipFrames(300))

    this.setRenderSession()
  }

  save(res) {
    this.stopRenderSession()
    const save = this.gameboy_instance[Object.keys(this.gameboy_instance)[0]].gameboy.saveState()
    
    const stream = Readable.from(JSON.stringify(compress(save)));
    
    res.setHeader('Content-Type', 'application/json');
    res.attachment('save.json')
    stream.pipe(res)
    this.setRenderSession()
  }

  load(loadObj) {
    this.stopRenderSession()

    this.gameboy_instance = new Gameboy()
    this.gameboy_instance.loadRom(rom)
    this.gameboy_instance[Object.keys(this.gameboy_instance)[0]].gameboy.saving(decompress(loadObj))

    this.setRenderSession()
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
    str += `    <tr>\n      <td colspan="4" align="center"><a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/client.html">Play with your Github account here !</a></td>\n    </tr>\n`
    str += `  </tbody>\n</table>\n\n`

    return str
  }

  async toMd() {
    let str = `<h3 align="center">GitHub Plays Pokemon ?</h3>\n`
    str += `<p align="center">`

    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input">\n    <img src="./assets/gameboy/top.png" width="308">\n  </a>\n`
    str += `  <br>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input">\n    <img src="./assets/gameboy/left.jpg" height="144" width="69.5">\n  </a>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input">\n    <img src="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/dogif" width="160" height="144">\n  </a>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input">\n    <img src="./assets/gameboy/right.jpg" height="144" width="69.5">\n  </a>\n`
    str += `  <br>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input">\n    <img src="./assets/gameboy/bot-screen.jpg" width="308">\n  </a>\n`
    str += `  <br>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input">\n    <img src="./assets/gameboy/rect.jpg" width="47" height="36">\n  </a>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input?input=up">\n    <img src="./assets/gameboy/croix-top.jpg" height="36">\n  </a>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input">\n    <img src="./assets/gameboy/rect.jpg" width="226.5" height="36">\n  </a>\n`
    str += `  <br>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input?input=left">\n    <img src="./assets/gameboy/croix-left.jpg" height="26">\n  </a>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input">\n    <img src="./assets/gameboy/croix-mid.jpg" height="26">\n  </a>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input?input=right">\n    <img src="./assets/gameboy/croix-right.jpg" height="26">\n  </a>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input?input=b">\n    <img src="./assets/gameboy/b.jpg" height="26">\n  </a>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input?input=a">\n    <img src="./assets/gameboy/a.jpg" height="26">\n  </a>\n`
    str += `  <br>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input">\n    <img src="./assets/gameboy/rect.jpg" width="47" height="36">\n  </a>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input?input=down">\n    <img src="./assets/gameboy/croix-bot.jpg" height="36">\n  </a>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input">\n    <img src="./assets/gameboy/rect.jpg" width="226.5" height="36">\n  </a>\n`
    str += `  <br>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input">\n    <img src="./assets/gameboy/rect.jpg" width="82" height="51">\n  </a>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input?input=select">\n    <img src="./assets/gameboy/select.jpg" height="51">\n  </a>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input?input=start">\n    <img src="./assets/gameboy/start.jpg" height="51">\n  </a>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input">\n    <img src="./assets/gameboy/rect.jpg" width="110" height="51">\n  </a>\n`
    str += `  <br>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input">\n    <img src="./assets/gameboy/bot-bot.png" width="308">\n  </a>\n\n`

    str += await this.renderInputBoard()

    str += `</p>\n\n<hr>\n\n`

    return str
  }
}

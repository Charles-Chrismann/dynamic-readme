import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createCanvas, ImageData } from '@napi-rs/canvas';
import { Response } from 'express';
import { Cron } from '@nestjs/schedule';
import { RedisService } from 'src/redis/redis.service';
import { GifEncoder } from '@skyra/gifenc';
import { Wrapper } from 'gbats';
import IReadmeModule from 'src/declarations/readme-module.interface';

const rom = fs.readFileSync(path.join(process.env.PWD, 'roms', process.env.ROM_GBA_NAME))

@Injectable()
export class GbaService implements OnModuleInit, IReadmeModule {
  private readonly logger = new Logger(GbaService.name)

  gba_wrapper: Wrapper
  canvas = createCanvas(240, 160)
  renderInterval: NodeJS.Timer | null
  renderTimeout: NodeJS.Timeout | null
  lastInputFrames: number[][] = []

  constructor(private readonly redis: RedisService) {}

  async onModuleInit() {

    this.gba_wrapper = new Wrapper({
      rom,
      canvas: this.canvas,
      updateMethod: 'manual'
    })
    const gi = await this.redis.client.get('gba:save_state')
    if(gi) {
      // console.log(globalThis)
      this.gba_wrapper.loadSaveState(gi)
    }
    this.setRenderSession()
  }

  @Cron(process.env.EMU_BACKUP_CRON)
  async backup() {
    this.logger.log('[SHEDULED] Saving gameboy')
    const save = await this.gba_wrapper.createSaveState()
    this.redis.client.set('gba:save_state', save)
  }

  setRenderInterval(frameInterval = 5) {
    this.renderInterval = setInterval(() => {
      this.gba_wrapper.frame()
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
      if(i % 4 === 0) {
        this.gba_wrapper.setScreen()
        this.gba_wrapper.frame()
        frames.push(this.gba_wrapper.getPixels())
        this.gba_wrapper.removeScreen()
      }
      else this.gba_wrapper.frame()
    }
    this.gba_wrapper.setScreen()
    return frames
  }

  async frame(res: Response) {
    const canvas = createCanvas(240, 160)
    const ctx = canvas.getContext('2d')
    let ctx_data = ctx.createImageData(240, 160);

    const screen = this.gba_wrapper.getPixels()

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

    const gifEncoder = new GifEncoder(240, 160)
    .setRepeat(-1)
    .setDelay(64)
    .setQuality(10);
    gifEncoder.createWriteStream().pipe(res)
    gifEncoder.start()
    const canvas = createCanvas(240, 160)
    const ctx = canvas.getContext('2d')
    let ctx_data = ctx.createImageData(240, 160);
    for(let i = 0; i < this.lastInputFrames.length; i++) {
      for (let j=0; j < this.lastInputFrames[i].length; j++){
        ctx_data.data[j] = this.lastInputFrames[i][j];
      }
      ctx.putImageData(ctx_data, 0, 0);
      gifEncoder.addFrame(ctx.getImageData(0, 0, 240, 160).data)
    }
    gifEncoder.finish();
  }

  input(input: number) {

    const tick = performance.now()
    if(input < 0 || input > 9) return
    this.stopRenderSession()
    this.lastInputFrames = []

    for(let i = 0; i < 5; i++) {
      this.gba_wrapper.press(input, 1)
      this.gba_wrapper.frame()
      this.lastInputFrames.push(this.gba_wrapper.getPixels())
    }
    this.lastInputFrames = this.lastInputFrames.concat(this.skipFrames(300))

    this.setRenderSession()
  }

  async save(res) {
    this.stopRenderSession()
    const save = await this.gba_wrapper.createSaveState()
    
    const stream = Readable.from(save);
    
    res.attachment('save.txt')
    stream.pipe(res)
    this.setRenderSession()
  }

  async load(loadObj: string) {
    this.stopRenderSession()

    await this.gba_wrapper.loadSaveState(loadObj)

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
    str += `    <tr>\n      <td colspan="4" align="center"><a href="${process.env.APP_PROTOCOL}://${process.env.APP_SUB_DOMAIN}.${process.env.APP_DOMAIN}/client.html">Play with your Github account here !</a></td>\n    </tr>\n`
    str += `  </tbody>\n</table>\n\n`

    return str
  }

  async toMd(BASE_URL: string) {
    const BASE_URL_GBA = `${BASE_URL}/gba`
    let str = `<h3 align="center">F*** Zodiac signs, let's play Pokemon together</h3>\n`
    str += `<p align="center">\n`

    str += `  <a href="${BASE_URL_GBA}/input">\n    <img src="./assets/gba/top.png">\n  </a>\n`
    str += `  <br>\n`
    str += `  <a href="${BASE_URL_GBA}/input">\n    <img src="./assets/gba/top-left.png">\n  </a>\n`
    str += `  <a href="${BASE_URL_GBA}/input">\n    <img src="${BASE_URL_GBA}/dogif" width="240" height="160">\n  </a>\n`
    str += `  <a href="${BASE_URL_GBA}/input">\n    <img src="./assets/gba/top-right.png">\n  </a>\n`
    str += `  <br>\n`
    str += `  <a href="${BASE_URL_GBA}/input">\n    <img src="./assets/gba/top-bottom.png">\n  </a>\n`
    str += `  <br>\n`
    str += `  <a href="${BASE_URL_GBA}/input?input=6">\n    <img src="./assets/gba/btn-up.png">\n  </a>\n`
    str += `  <a href="${BASE_URL_GBA}/input">\n    <img src="./assets/gba/bottom-top-right.png">\n  </a>\n`
    str += `  <br>\n`
    str += `  <a href="${BASE_URL_GBA}/input?input=5">\n    <img src="./assets/gba/btn-left.png">\n  </a>\n`
    str += `  <a href="${BASE_URL_GBA}/input">\n    <img src="./assets/gba/btn-mid.png">\n  </a>\n`
    str += `  <a href="${BASE_URL_GBA}/input?input=4">\n    <img src="./assets/gba/btn-right.png">\n  </a>\n`
    str += `  <a href="${BASE_URL_GBA}/input?input=1">\n    <img src="./assets/gba/btn-b.png">\n  </a>\n`
    str += `  <a href="${BASE_URL_GBA}/input?input=0">\n    <img src="./assets/gba/btn-a.png">\n  </a>\n`
    str += `  <br>\n`
    str += `  <a href="${BASE_URL_GBA}/input?input=7">\n    <img src="./assets/gba/btn-down.png">\n  </a>\n`
    str += `  <a href="${BASE_URL_GBA}/input">\n    <img src="./assets/gba/reactange.png">\n  </a>\n`
    str += `  <br>\n`
    str += `  <a href="${BASE_URL_GBA}/input?input=2">\n    <img src="./assets/gba/btn-select.png">\n  </a>\n`
    str += `  <a href="${BASE_URL_GBA}/input?input=3">\n    <img src="./assets/gba/btn-start.png">\n  </a>\n`

    str += `</p>\n\n<hr>\n\n`

    return str
  }
}

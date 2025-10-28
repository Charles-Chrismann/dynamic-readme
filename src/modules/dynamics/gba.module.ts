import * as fs from 'fs';
import * as path from 'path';
import { Wrapper } from "gbats";
import { AbstractDynamicModule } from "../abstract.module";
import { createCanvas } from "@napi-rs/canvas";
import { RedisService } from "src/redis/redis.service";
import { CronJob } from 'cron';
import { Logger } from '@nestjs/common';
import { buffer } from 'stream/consumers';
import { GifEncoder } from '@skyra/gifenc';
import { Readable } from 'stream';
import { AppConfigService } from 'src/services';
import { Response } from 'express';

interface Data {
  uuid: string
}

interface Options {
}

export class GbaDynamicModule extends AbstractDynamicModule<Data, Options> {

  gba_wrapper: Wrapper
  canvas = createCanvas(240, 160)
  redis: RedisService
  cron: CronJob
  protected readonly logger = new Logger("GBA")
  gifBuffer: Buffer
  redisKey: string

  constructor(data: Data, options?: Options) {
    super(data, options)
    this.redis = AppConfigService.redis
    this.redisKey = `gba:save_state:${this.data.uuid}`
  }

  public async init(): Promise<void> {

    const rom = fs.readFileSync(path.join(process.env.PWD, 'roms', process.env.ROM_GBA_NAME))

    this.gba_wrapper = new Wrapper({
      rom,
      canvas: this.canvas,
      updateMethod: 'manual'
    })
    const gi = await this.redis.client.get(this.redisKey)
    if(gi) {
      await this.gba_wrapper.loadSaveState(gi)
    }

    const frames = this.skipFrames(600, true)
    this.gifBuffer = await this.createGifBuffer(frames)
    
    this.cron = new CronJob(process.env.EMU_BACKUP_CRON, () => this.backup(), null, true)
  }

  async backup() {
    this.logger.log('[SHEDULED] Saving gba')
    const save = await this.gba_wrapper.createSaveState()
    this.redis.client.set(this.redisKey, save)
  }

  public render(): string | Promise<string> {
    return ''
  }

  async input(input: number) {
    if(input < 0 || input > 9) return
    const frames = []


    for(let i = 0; i < 5; i++) {
      this.gba_wrapper.press(input, 1)
      this.gba_wrapper.frame()
      frames.push(this.gba_wrapper.getPixels())
    }
    frames.push(...this.skipFrames(300, true))
    
    this.gifBuffer = await this.createGifBuffer(frames)
  }

  skipFrames(
    n: number,
    returnFrames: boolean = false
  ): undefined | number[][] {
    const start = performance.now()

    if(!returnFrames) {
      for(let i = 0; i < n; i++) this.gba_wrapper.frame()

      if(AppConfigService.getOrThrow<string>('NODE_ENV') === "development")
        this.logger.debug(`${n} frames skipped in ${performance.now() - start}ms`)

      return
    }
    
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

    if(AppConfigService.getOrThrow<string>('NODE_ENV') === "development")
      this.logger.debug(`${n} frames skipped in ${performance.now() - start}ms`)

    return frames
  }

  async createGifBuffer(
    frames: number[][]
  ) {
    const start = performance.now()

    const gifEncoder = new GifEncoder(240, 160)
    const stream = gifEncoder.createReadStream();

    gifEncoder.setRepeat(-1).setDelay(64).setQuality(10);

    gifEncoder.start()
    const canvas = createCanvas(240, 160)
    const ctx = canvas.getContext('2d')
    let ctx_data = ctx.createImageData(240, 160);
    for(let i = 0; i < frames.length; i++) {
      for (let j=0; j < frames[i].length; j++){
        ctx_data.data[j] = frames[i][j];
      }
      ctx.putImageData(ctx_data, 0, 0);
      gifEncoder.addFrame(ctx.getImageData(0, 0, 240, 160).data)
    }
    gifEncoder.finish();

    const gifBuffer = await buffer(stream)
    
    if(AppConfigService.getOrThrow<string>('NODE_ENV') === "development")
      this.logger.debug(`Gif buffer created in: ${performance.now() - start}ms`)

    return gifBuffer
  }

  async save(res: Response) {
    const save = await this.gba_wrapper.createSaveState()
    
    const stream = Readable.from(save);
    
    res.attachment('save.txt')
    stream.pipe(res)
    this.skipFrames(600)
  }

  async load(loadObj: string) {

    await this.gba_wrapper.loadSaveState(loadObj)

    const frames = this.skipFrames(600, true)
    this.gifBuffer = await this.createGifBuffer(frames)

    const save = await this.gba_wrapper.createSaveState()
    await this.redis.client.set(this.redisKey, save)
  }

  getImageUrl(url_fragment: string) {
    const env = AppConfigService.getOrThrow<string>('NODE_ENV')
    if(env === "production")
      return `./assets/gba/${url_fragment}`
    return `https://raw.githubusercontent.com/Charles-Chrismann/Charles-Chrismann/main/assets/gba/${url_fragment}`
  }

  async toMd() {
    const BASE_URL_GBA = `${process.env.APP_PROTOCOL}://${process.env.APP_SUB_DOMAIN}.${process.env.APP_DOMAIN}/gba`
    const env = AppConfigService.getOrThrow<string>('NODE_ENV')
    const BASE_URL_GBA_WITH_ID = 
      env === "production"
      ? `${BASE_URL_GBA}/${this.data['uuid']}`
      : `http://localhost:3000/gba/${this.data['uuid']}`
    let str = `<h3 align="center">F*** Zodiac signs, let's play Pokemon together</h3>\n`
    str += `<p align="center">\n`

    str += `  <a href="${BASE_URL_GBA_WITH_ID}/input">\n    <img src="${this.getImageUrl("top.png")}">\n  </a>\n`
    str += `  <br>\n`
    str += `  <a href="${BASE_URL_GBA_WITH_ID}/input">\n    <img src="${this.getImageUrl("top-left.png")}">\n  </a>\n`
    str += `  <a href="${BASE_URL_GBA_WITH_ID}/input">\n    <img src="${BASE_URL_GBA_WITH_ID}/gif" width="240" height="160">\n  </a>\n`
    str += `  <a href="${BASE_URL_GBA_WITH_ID}/input">\n    <img src="${this.getImageUrl("top-right.png")}">\n  </a>\n`
    str += `  <br>\n`
    str += `  <a href="${BASE_URL_GBA_WITH_ID}/input">\n    <img src="${this.getImageUrl("top-bottom.png")}">\n  </a>\n`
    str += `  <br>\n`
    str += `  <a href="${BASE_URL_GBA_WITH_ID}/input?input=6">\n    <img src="${this.getImageUrl("btn-up.png")}">\n  </a>\n`
    str += `  <a href="${BASE_URL_GBA_WITH_ID}/input">\n    <img src="${this.getImageUrl("bottom-top-right.png")}">\n  </a>\n`
    str += `  <br>\n`
    str += `  <a href="${BASE_URL_GBA_WITH_ID}/input?input=5">\n    <img src="${this.getImageUrl("btn-left.png")}">\n  </a>\n`
    str += `  <a href="${BASE_URL_GBA_WITH_ID}/input">\n    <img src="${this.getImageUrl("btn-mid.png")}">\n  </a>\n`
    str += `  <a href="${BASE_URL_GBA_WITH_ID}/input?input=4">\n    <img src="${this.getImageUrl("btn-right.png")}">\n  </a>\n`
    str += `  <a href="${BASE_URL_GBA_WITH_ID}/input?input=1">\n    <img src="${this.getImageUrl("btn-b.png")}">\n  </a>\n`
    str += `  <a href="${BASE_URL_GBA_WITH_ID}/input?input=0">\n    <img src="${this.getImageUrl("btn-a.png")}">\n  </a>\n`
    str += `  <br>\n`
    str += `  <a href="${BASE_URL_GBA_WITH_ID}/input?input=7">\n    <img src="${this.getImageUrl("btn-down.png")}">\n  </a>\n`
    str += `  <a href="${BASE_URL_GBA_WITH_ID}/input">\n    <img src="${this.getImageUrl("reactange.png")}">\n  </a>\n`
    str += `  <br>\n`
    str += `  <a href="${BASE_URL_GBA_WITH_ID}/input?input=2">\n    <img src="${this.getImageUrl("btn-select.png")}">\n  </a>\n`
    str += `  <a href="${BASE_URL_GBA_WITH_ID}/input?input=3">\n    <img src="${this.getImageUrl("btn-start.png")}">\n  </a>\n`

    str += `</p>\n\n<hr>\n\n`

    return str
  }
}
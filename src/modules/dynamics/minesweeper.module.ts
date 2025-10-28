import { commandOptions } from "redis";
import { GifEncoder } from "@skyra/gifenc";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { AbstractDynamicModule } from "../abstract.module";
import { Minesweeper } from "src/games/minesweeper/classes/Minesweeper";
import { AppConfigService } from "src/services";
import { buffer } from "stream/consumers";

interface Data {
  uuid: string
}

interface Options {
}

export class MinesweeperDynamicModule extends AbstractDynamicModule<Data, Options> {

  redisKey: string
  redisImagesKey: string
  gifBuffer: Buffer

  async init() {
    this.redisKey = `msw:${this.data['uuid']}`
    this.redisImagesKey = `msw:${this.data['uuid']}:images`
    if(!await AppConfigService.redis.client.get(this.redisKey)) await this.new()
    else {
      await this.generatehistoryGif()
    }
  }

  async new() {
    const minesweeper = new Minesweeper(18, 14, 24)
    await Promise.all([
      AppConfigService.redis.client.set(this.redisKey, JSON.stringify(minesweeper)),
      AppConfigService.redis.client.unlink(this.redisImagesKey)
    ])
    await this.renderGameImageCtx(true, minesweeper)
    this.gifBuffer = null
    this.needsRender = true
    return minesweeper
  }

  /**
   * @param x 
   * @param y 
   * @returns true if the map has been updated false otherwise
   */
  async click(x: number, y: number): Promise<boolean> {
    const minesweeperData: Record<string, any> = JSON.parse(await AppConfigService.redis.client.get(this.redisKey))
    const minesweeper = minesweeperData ? new Minesweeper(minesweeperData) : await this.new()
    if(minesweeper.gameStatus === "Ended") return false
    if(!minesweeper.HandleClick({x: x, y: y})) return false
    if(minesweeper.map.flat().filter(cell => cell.hidden).length === minesweeper.bombsCount) minesweeper.gameStatus = "Endend"
    await this.renderGameImageCtx(false, minesweeper)
    await AppConfigService.redis.client.set(this.redisKey, JSON.stringify(minesweeper))
    this.needsRender = true
    this.generatehistoryGif()
    return true
  }

  async renderGameImageCtx(isFirst: boolean = false, minesweeperData: Record<string, any>) {
    const tileSize = 16;
    const canvas = createCanvas(tileSize * minesweeperData.width, tileSize * minesweeperData.height)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, tileSize * minesweeperData.width, tileSize * minesweeperData.height)

    if(isFirst) {
      AppConfigService.redis.client.hSet(this.redisImagesKey, 0, ctx.canvas.toBuffer('image/png'))
      return
    }

    const emojis = {}
    const emojiList = ["one", "two", "three", "four", "five", "six", "seven", "eight", "boom"]
    for(let i = 0; i < minesweeperData.width; i++) {
      for(let j = 0; j < minesweeperData.height; j++) {
        const cell = minesweeperData.map[j][i]
        if(cell.hidden) continue
        if(!cell.value) {
          ctx.fillStyle = "#ffffff"
          ctx.fillRect(i * tileSize, j * tileSize, tileSize, tileSize)
          continue
        }
        const emojiImage = await (emojis[emojiList[cell.value - 1]] ?? (async () => {
          const emoji = emojiList[cell.value - 1]
          emojis[emoji] = await loadImage(`./src/assets/emojis/${emoji}.png`)
          return emojis[emoji]
        })())
        ctx.drawImage(emojiImage, cell.x * tileSize, cell.y * tileSize, tileSize, tileSize)
      }
    }
    const savedImages = await AppConfigService.redis.client.hGetAll(this.redisImagesKey)
    AppConfigService.redis.client.hSet(this.redisImagesKey, Object.keys(savedImages).length, ctx.canvas.toBuffer('image/png'))
  }

  async generatehistoryGif() {
    const minesweeperData: Record<string, any> = JSON.parse(await AppConfigService.redis.client.get(this.redisKey))
    const imagesPromises = Object.values(await AppConfigService.redis.client.hGetAll(commandOptions({ returnBuffers: true }), this.redisImagesKey)).map(async buffer => await loadImage(buffer))
    const images = await Promise.all(imagesPromises)

    const tileSize = 16;
    const canvasWidth = minesweeperData.width * tileSize
    const canvasHeight = minesweeperData.height * tileSize
    const gifEncoder = new GifEncoder(canvasWidth, canvasHeight)
    .setRepeat(0)
    .setDelay(Math.floor(5000 / images.length || 1))
    .setQuality(10)
    const stream = gifEncoder.createReadStream();
    gifEncoder.start()

    for(let i = 0; i < images.length; i++) {
      const image = images[i]
      const canvas = createCanvas(canvasWidth, canvasHeight)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(image, 0, 0)
      gifEncoder.addFrame(ctx.getImageData(0, 0, canvasWidth, canvasHeight).data)
    }
    gifEncoder.finish()

    this.gifBuffer = await buffer(stream)
  }
  
  public async render(): Promise<string> {

    const { APP_BASE_URL } = AppConfigService
    const BASE_URL = `${APP_BASE_URL}/minesweeper/${this.data.uuid}`
    
    const minesweeper: Minesweeper = new Minesweeper(JSON.parse(await AppConfigService.redis.client.get(this.redisKey)))
    let str = `<h3 align="center">A classic Minesweeper</h3>\n`
    str += `<p align="center">\n`
    str += minesweeper.map.map(row => `${row.map(cell => cell.hidden ? `  <a href="${BASE_URL}/click?x=${cell.x}&y=${cell.y}">${cell.toEmoji()}</a>\n` : `  <span>${cell.toEmoji()}</span>\n`).join('')}`).join('  <br>\n')
    str += `</p>\n`
    if(minesweeper.gameStatus === "Not Started") str += `<p align="center">Come on, try it</p>\n`
    else if(minesweeper.gameStatus === "Started") str += `<p align="center">Keep clearing, there are still many mines left.</p>\n`
    else str += minesweeper.gameLoosed ? `<p align="center">You lost don't hesitate to try again</p>\n` : `<p align="center">Congrats you won !</p>\n`
    
    const historyLength = Object.values(await AppConfigService.redis.client.hGetAll(commandOptions({ returnBuffers: true }), this.redisImagesKey)).length
    if(historyLength > 1) str += `<p align="center">\n  <img width="256" src="${BASE_URL}/gif" />\n</p>\n`

    str += `<h3 align="center">\n  <a href="${BASE_URL}/new">Reset Game</a>\n</h3>\n\n<hr>\n\n`

    return str
  }

  async gif() {
    return this.gifBuffer
  }
}
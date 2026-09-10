import { commandOptions } from "redis";
import { GifEncoder } from "@skyra/gifenc";
import { createCanvas, Image, loadImage } from "@napi-rs/canvas";
import { AbstractDynamicModule } from "../abstract.module";
import { Minesweeper } from "src/games/minesweeper/classes/Minesweeper";
import { AppConfigService } from "src/services";
import { buffer } from "stream/consumers";
import { readFile, writeFile } from "fs/promises";
import { minesweeperSchema } from "src/zod.zodobject";
import type { Minesweeper as MinesweeperType } from '../../zod.zodobject'

interface Data {
  uuid: string
}

interface Options {
}

export class MinesweeperDynamicModule extends AbstractDynamicModule<Data, Options> {

  minesweeper!: Minesweeper
  frames: Uint8ClampedArray<ArrayBufferLike>[] = []
  gifBuffer: Buffer | null = null

  async init() {
    try {
      const minsweeperSaveStr = (await readFile(`./config/datas/minesweeper/${this.data['uuid']}.json`)).toString('utf-8')
      const { map, history } = minesweeperSchema.parse(JSON.parse(minsweeperSaveStr))
      
      const minesweeper = new Minesweeper()
      minesweeper.init({
        width: map[0].length,
        height: map.length,
        bombsCount: map.flat().filter(c => c.value === 9).length
      })

      for(const [x, y] of history) {
        minesweeper.handleClick({ x, y })
        const frame = await this.renderGameImageCtx(minesweeper)
        this.frames.push(frame)
      }

      this.generatehistoryGif()

    } catch (err: unknown) {
      this.new()
      await this.save()
    }
  }

  async save() {
    const { history, map } = this.minesweeper
    const data: MinesweeperType = {
      id: this.data['uuid'],
      history,
      map,
    }
    await writeFile(`./config/datas/minesweeper/${this.data['uuid']}.json`, JSON.stringify(data))
  }

  async new() {
    this.minesweeper = new Minesweeper().init({ width: 18, height: 14, bombsCount: 24 })

    const tileSize = 16;
    const width = tileSize * this.minesweeper.width;
    const height = tileSize * this.minesweeper.height;
    const canvas = createCanvas(tileSize * width, tileSize * height)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, tileSize * width, tileSize * height)
    this.frames.push(ctx.getImageData(0, 0, width, height).data)

    this.gifBuffer = null
    this.needsRender = true
    return this.minesweeper
  }

  /**
   * @param x 
   * @param y 
   * @returns true if the map has been updated false otherwise
   */
  async click(x: number, y: number): Promise<boolean> {
    if(this.minesweeper.gameStatus === "Ended") return false
    if(!this.minesweeper.handleClick({x: x, y: y})) return false
    this.minesweeper.history.push([x, y])
    if(this.minesweeper.map.flat().filter(cell => cell.hidden).length === this.minesweeper.bombsCount) this.minesweeper.gameStatus = "Ended"
    await this.renderGameImageCtx(this.minesweeper)
    await this.save()
    this.needsRender = true
    this.generatehistoryGif()
    return true
  }

  async renderGameImageCtx(minesweeperData: Minesweeper) {
    const tileSize = 16;
    const width = tileSize * minesweeperData.width;
    const height = tileSize * minesweeperData.height;
    const canvas = createCanvas(tileSize * width, tileSize * height)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, tileSize * width, tileSize * height)

    const emojis: Record<string, Image> = {}
    const emojiList = ["one", "two", "three", "four", "five", "six", "seven", "eight", "boom"]
    for(let i = 0; i < width; i++) {
      for(let j = 0; j < height; j++) {
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
    return ctx.getImageData(0, 0, width, height).data;
  }

  async generatehistoryGif() {
    const tileSize = 16;
    const canvasWidth = this.minesweeper.width * tileSize
    const canvasHeight = this.minesweeper.height * tileSize
    const gifEncoder = new GifEncoder(canvasWidth, canvasHeight)
      .setRepeat(0)
      .setDelay(Math.floor(5000 / this.frames.length || 1))
      .setQuality(10)
    const stream = gifEncoder.createReadStream();
    gifEncoder.start()


    for (const frame of this.frames) {
      gifEncoder.addFrame(frame);
    }
    gifEncoder.finish()

    this.gifBuffer = await buffer(stream)
  }
  
  public async render(): Promise<string> {

    const { APP_BASE_URL } = AppConfigService
    const BASE_URL = `${APP_BASE_URL}/minesweeper/${this.data.uuid}`
    
    const minesweeper = this.minesweeper
    let str = `<h3 align="center">A classic Minesweeper</h3>\n`
    str += `<p align="center">\n`
    str += minesweeper.map.map(row => `${row.map(cell => cell.hidden ? `  <a href="${BASE_URL}/click?x=${cell.x}&y=${cell.y}">${cell.toEmoji()}</a>\n` : `  <span>${cell.toEmoji()}</span>\n`).join('')}`).join('  <br>\n')
    str += `</p>\n`
    if(minesweeper.gameStatus === "Not Started") str += `<p align="center">Come on, try it</p>\n`
    else if(minesweeper.gameStatus === "Running") str += `<p align="center">Keep clearing, there are still many mines left.</p>\n`
    else str += minesweeper.gameLoosed ? `<p align="center">You lost don't hesitate to try again</p>\n` : `<p align="center">Congrats you won !</p>\n`
    
    const historyLength = this.minesweeper.history.length
    if(historyLength > 1) str += `<p align="center">\n  <img width="256" src="${BASE_URL}/gif" />\n</p>\n`

    str += `<h3 align="center">\n  <a href="${BASE_URL}/new">Reset Game</a>\n</h3>\n\n<hr>\n\n`

    return str
  }

  async gif() {
    return this.gifBuffer
  }
}
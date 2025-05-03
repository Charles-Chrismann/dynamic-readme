import * as fs from 'fs';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Minesweeper } from './classes/Minesweeper';
import { RedisService } from 'src/redis/redis.service';
import { commandOptions } from 'redis';
import { GifEncoder } from '@skyra/gifenc';
import IReadmeModule from 'src/declarations/readme-module.interface';

@Injectable()
export class MinesweeperService implements OnModuleInit, IReadmeModule {
  constructor(private redisService: RedisService) {}

  async onModuleInit() {
    if(!await this.redisService.client.get('minesweeper')) await this.new()
  }

  async new() {
    const minesweeper = new Minesweeper(18, 14, 24)
    await Promise.all([
      this.redisService.client.set('minesweeper', JSON.stringify(minesweeper)),
      this.redisService.client.unlink('minesweeperImages')
    ])
    await this.renderGameImageCtx(true, minesweeper)
    return minesweeper
  }

  /**
   * @param x 
   * @param y 
   * @returns true if the map has been updated false otherwise
   */
  async click(x: number, y: number): Promise<boolean> {
    const minesweeperData: Record<string, any> = JSON.parse(await this.redisService.client.get('minesweeper'))
    const minesweeper = minesweeperData ? new Minesweeper(minesweeperData) : await this.new()
    if(minesweeper.gameStatus === "Ended") return false
    if(!minesweeper.HandleClick({x: x, y: y})) return false
    if(minesweeper.map.flat().filter(cell => cell.hidden).length === minesweeper.bombsCount) minesweeper.gameStatus = "Endend"
    await this.renderGameImageCtx(false, minesweeper)
    await this.redisService.client.set('minesweeper', JSON.stringify(minesweeper))
    return true
  }

  async renderGameImageCtx(isFirst: boolean = false, minesweeperData: Record<string, any>) {
    const tileSize = 16;
    const canvas = createCanvas(tileSize * minesweeperData.width, tileSize * minesweeperData.height)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, tileSize * minesweeperData.width, tileSize * minesweeperData.height)

    if(isFirst) {
      this.redisService.client.hSet('minesweeperImages', 0, ctx.canvas.toBuffer('image/png'))
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
    const savedImages = await this.redisService.client.hGetAll('minesweeperImages')
    this.redisService.client.hSet('minesweeperImages', Object.keys(savedImages).length, ctx.canvas.toBuffer('image/png'))
  }

  async generatehistoryGif() {
    const minesweeperData: Record<string, any> = JSON.parse(await this.redisService.client.get('minesweeper'))
    const imagesPromises = Object.values(await this.redisService.client.hGetAll(commandOptions({ returnBuffers: true }),'minesweeperImages')).map(async buffer => await loadImage(buffer))
    const images = await Promise.all(imagesPromises)

    const tileSize = 16;
    const canvasWidth = minesweeperData.width * tileSize
    const canvasHeight = minesweeperData.height * tileSize
    const gifEncoder = new GifEncoder(canvasWidth, canvasHeight)
    .setRepeat(0)
    .setDelay(Math.floor(5000 / images.length || 1))
    .setQuality(10)
    gifEncoder.createWriteStream().pipe(fs.createWriteStream('./public/minesweeper.gif'))
    gifEncoder.start()

    for(let i = 0; i < images.length; i++) {
      const image = images[i]
      const canvas = createCanvas(canvasWidth, canvasHeight)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(image, 0, 0)
      gifEncoder.addFrame(ctx.getImageData(0, 0, canvasWidth, canvasHeight).data)
    }
    gifEncoder.finish()
  }

  async toMd(BASE_URL: string) {
    this.generatehistoryGif() // asyncrone  mais peux poser un probleme de timing
    
    const minesweeper: Minesweeper = new Minesweeper(JSON.parse(await this.redisService.client.get('minesweeper')))
    let str = `<h3 align="center">A classic Minesweeper</h3>\n`
    str += `<p align="center">\n`
    str += minesweeper.map.map(row => `${row.map(cell => cell.hidden ? `  <a href="${BASE_URL}/minesweeper/click?x=${cell.x}&y=${cell.y}">${cell.toEmoji()}</a>\n` : `  <span>${cell.toEmoji()}</span>\n`).join('')}`).join('  <br>\n')
    str += `</p>\n`
    if(minesweeper.gameStatus === "Not Started") str += `<p align="center">Come on, try it</p>\n`
    else if(minesweeper.gameStatus === "Started") str += `<p align="center">Keep clearing, there are still many mines left.</p>\n`
    else str += minesweeper.gameLoosed ? `<p align="center">You lost don't hesitate to try again</p>\n` : `<p align="center">Congrats you won !</p>\n`
    
    const historyLength = Object.values(await this.redisService.client.hGetAll(commandOptions({ returnBuffers: true }),'minesweeperImages')).length
    if(historyLength) str += `<p align="center">\n  <img width="256" src="${BASE_URL}/minesweeper.gif" />\n</p>\n`

    str += `<h3 align="center">\n  <a href="${BASE_URL}/minesweeper/new">Reset Game</a>\n</h3>\n\n<hr>\n\n`

    return str
  }
}

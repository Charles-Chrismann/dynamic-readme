import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createCanvas } from 'canvas';
import { compress, decompress } from 'compress-json';
const Gameboy = require('serverboy')

const rom = fs.readFileSync(path.join(process.env.PWD, 'roms', process.env.ROM_NAME))

@Injectable()
export class GameboyService implements OnModuleInit {
  private readonly logger = new Logger(GameboyService.name)

  gameboy_instance: any
  currentScreen: any
  renderInterval: NodeJS.Timer | null
  renderTimeout: NodeJS.Timeout | null

  constructor() {}

  async onModuleInit() {
    if(!this.gameboy_instance) {
      this.gameboy_instance = new Gameboy()
      this.gameboy_instance.loadRom(rom)
      this.setRenderSession()
    }
  }

  setRenderInterval(frameInterval = 5) {
    this.renderInterval = setInterval(() => {
      this.gameboy_instance.doFrame()
    }, frameInterval)
  }

  stopRenderInterval(intervalId) {
    console.log('Interupt render')
    clearInterval(intervalId)
  }

  setRenderTimeout(intervalId, timeout = 60000) {
    this.renderTimeout = setTimeout(() => this.stopRenderInterval(intervalId), timeout)
  }

  stopRenderTimeout() {
    clearTimeout(this.renderTimeout)
  }

  setRenderSession() {
    console.log('start sess')
    this.setRenderInterval()
    this.setRenderTimeout(this.renderInterval)
  }

  stopRenderSession() {
    console.log('stop sess')
    this.stopRenderInterval(this.renderInterval)
    this.stopRenderTimeout()
  }

  skipFrames(n) {
    for(let i = 0; i < n; i++) this.gameboy_instance.doFrame()
  }

  frame(res) {
    const canvas = createCanvas(160, 144)
    const ctx = canvas.getContext('2d')
    let ctx_data = ctx.createImageData(160, 144);

    const screen = this.gameboy_instance.doFrame()

    for (var i=0; i < screen.length; i++){
      ctx_data.data[i] = screen[i];
    }

    ctx.putImageData(ctx_data, 0, 0);

    const stream = canvas.createPNGStream()
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=0')
    stream.pipe(res)
  }

  input(input: string) {
    this.stopRenderSession()

    for(let i = 0; i < 5; i++) {
      this.gameboy_instance.pressKey(input)
      this.gameboy_instance.doFrame()
    }

    this.skipFrames(300)
    this.currentScreen = this.gameboy_instance.doFrame()

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


  toMd() {
    let str = `<h3 align="center">GitHub Plays Pokemon ?</h3>\n`
    str += `<p align="center">`

    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input">\n    <img src="./assets/gameboy/top.png" width="308">\n  </a>\n`
    str += `  <br>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input">\n    <img src="./assets/gameboy/left.jpg" height="144" width="69.5">\n  </a>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input">\n    <img src="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/doframe" width="160" height="144">\n  </a>\n`
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
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input">\n    <img src="./assets/gameboy/bot-bot.png" width="308">\n  </a>\n`

    str += `</p>\n\n<hr>\n\n`

    return str
  }
}

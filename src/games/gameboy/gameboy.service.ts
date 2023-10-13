import * as fs from 'fs';
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as path from 'path';
import { createCanvas } from 'canvas';
const Gameboy = require('serverboy')

const rom = fs.readFileSync(path.join(process.env.PWD, 'roms', process.env.ROM_NAME))

@Injectable()
export class GameboyService implements OnModuleInit {
  gameboy_instance: any
  currentScreen: any
  isRendering = false
  renderInterval: NodeJS.Timer | null

  async onModuleInit() {
    if(!this.gameboy_instance) {
      this.gameboy_instance = new Gameboy()
      this.gameboy_instance.loadRom(rom)
      this.renderInterval = setInterval(() => {
        if(this.isRendering) return
        this.currentScreen = this.gameboy_instance.doFrame()
      }, 5)
    }
  }

  frame(res) {
    const canvas = createCanvas(160, 144)
    const ctx = canvas.getContext('2d')
    let ctx_data = ctx.createImageData(160, 144);

    for (var i=0; i < this.currentScreen.length; i++){
      ctx_data.data[i] = this.currentScreen[i];
    }

    ctx.putImageData(ctx_data, 0, 0);

    const stream = canvas.createPNGStream()
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=0')
    stream.pipe(res)
  }

  input(input: string) {
    this.isRendering = true

    for(let i = 0; i < 5; i++) {
      this.gameboy_instance.pressKey(input)
      this.gameboy_instance.doFrame()
    }

    for(let i = 0; i < 12; i++) {
      this.gameboy_instance.doFrame()
    }
    this.currentScreen = this.gameboy_instance.doFrame()

    this.isRendering = false
  }

  save() {
    this.isRendering = true
    const save = this.gameboy_instance[Object.keys(this.gameboy_instance)[0]].gameboy.saveState()
    this.isRendering = false

    return { save }
  }

  load(loadObj) {
    this.isRendering = true

    this.gameboy_instance = new Gameboy()
    this.gameboy_instance.loadRom(rom)
    this.gameboy_instance[Object.keys(this.gameboy_instance)[0]].gameboy.saving(loadObj)

    this.isRendering = false
  }


  toMd() {
    let str = `<h3 align="center">GitHub Plays Pokemon ?</h3>\n`
    str += `<p align="center">`

    str += `  <a href="#">\n    <img src="./assets/gameboy/top.png" width="308">\n  </a>\n`
    str += `  <br>\n`
    str += `  <a href="#">\n    <img src="./assets/gameboy/left.jpg" height="144" width="69.5">\n  </a>\n`
    str += `  <a href="#">\n    <img src="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/doframe" width="160" height="144">\n  </a>\n`
    str += `  <a href="#">\n    <img src="./assets/gameboy/right.jpg" height="144" width="69.5">\n  </a>\n`
    str += `  <br>\n`
    str += `  <a href="#">\n    <img src="./assets/gameboy/bot-screen.jpg" width="308">\n  </a>\n`
    str += `  <br>\n`
    str += `  <a href="#">\n    <img src="./assets/gameboy/rect.jpg" width="47" height="36">\n  </a>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input-commit?input=up">\n    <img src="./assets/gameboy/croix-top.jpg" height="36">\n  </a>\n`
    str += `  <a href="#">\n    <img src="./assets/gameboy/rect.jpg" width="226.5" height="36">\n  </a>\n`
    str += `  <br>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input-commit?input=left">\n    <img src="./assets/gameboy/croix-left.jpg" height="26">\n  </a>\n`
    str += `  <a href="#">\n    <img src="./assets/gameboy/croix-mid.jpg" height="26">\n  </a>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input-commit?input=right">\n    <img src="./assets/gameboy/croix-right.jpg" height="26">\n  </a>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input-commit?input=b">\n    <img src="./assets/gameboy/b.jpg" height="26">\n  </a>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input-commit?input=a">\n    <img src="./assets/gameboy/a.jpg" height="26">\n  </a>\n`
    str += `  <br>\n`
    str += `  <a href="#">\n    <img src="./assets/gameboy/rect.jpg" width="47" height="36">\n  </a>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input-commit?input=down">\n    <img src="./assets/gameboy/croix-bot.jpg" height="36">\n  </a>\n`
    str += `  <a href="#">\n    <img src="./assets/gameboy/rect.jpg" width="226.5" height="36">\n  </a>\n`
    str += `  <br>\n`
    str += `  <a href="#">\n    <img src="./assets/gameboy/rect.jpg" width="82" height="51">\n  </a>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input-commit?input=select">\n    <img src="./assets/gameboy/select.jpg" height="51">\n  </a>\n`
    str += `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/gameboy/input-commit?input=start">\n    <img src="./assets/gameboy/start.jpg" height="51">\n  </a>\n`
    str += `  <a href="#">\n    <img src="./assets/gameboy/rect.jpg" width="110" height="51">\n  </a>\n`
    str += `  <br>\n`
    str += `  <a href="#">\n    <img src="./assets/gameboy/bot-bot.png" width="308">\n  </a>\n`

    str += `</p>\n\n<hr>\n\n`

    return str
  }
}

import * as fs from 'fs';
import { createCanvas } from 'canvas';
const GIFEncoder = require('gifencoder');

import { Injectable } from '@nestjs/common';
import { Minesweeper } from './classes/Minesweeper';

@Injectable()
export class MinesweeperService {
    minesweeper: Minesweeper
    history: any[] = []

    constructor() {
      this.new()
    }

    new() {
        this.minesweeper = new Minesweeper(18, 14, 24)
        this.history = []
        this.history.push(this.renderGameImageCtx(true))
        this.generatehistoryGif()
    }

    click(x: number, y: number) {
        if(!this.minesweeper) this.minesweeper = new Minesweeper(18, 14, 24);
        if(this.minesweeper.gameStatus === "Ended") return
        this.minesweeper.HandleClick({x: x, y: y})
        if(this.minesweeper.map.flat().filter(cell => cell.hidden).length === this.minesweeper.bombsCount) this.minesweeper.gameStatus = "Endend"
        this.history.push(this.renderGameImageCtx())
    }

    renderGameImageCtx(isFirst: boolean = false) {
      const tileSize = 16;
      const canvas = createCanvas(tileSize * this.minesweeper.width, tileSize * this.minesweeper.height)
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, tileSize * this.minesweeper.width, tileSize * this.minesweeper.height)

      if(isFirst) return ctx
      
      this.minesweeper.map.forEach(row => {
        row.forEach(cell => {
          ctx.fillStyle = "#ffffff"
          if(cell.hidden) ctx.fillStyle = "#000000"
          else if(cell.value === 0) ctx.fillStyle = "#ffffff"
          else if(cell.value === 9) ctx.fillStyle = "#ff0000"
          else ctx.fillStyle = "#0000ff"
          ctx.fillRect(cell.x * tileSize, cell.y * tileSize, tileSize, tileSize)
        })
      })

      return ctx
    }

    generatehistoryGif() {
      const tileSize = 16;
      const gifEncoder = new GIFEncoder(this.minesweeper.width * tileSize, this.minesweeper.height * tileSize)
      gifEncoder.createWriteStream().pipe(fs.createWriteStream('./public/minesweeper.gif'))
      gifEncoder.start()
      gifEncoder.setRepeat(0)
      gifEncoder.setDelay(500)
      gifEncoder.setQuality(10)
      this.history.forEach(buffer => {
        gifEncoder.addFrame(buffer)
      })
      gifEncoder.finish()
    }

    toMd() {
      this.generatehistoryGif()
        let str = `<h3 align="center">A classic Minesweeper</h3>`
        str += `<p align="center">`
        this.minesweeper.map.forEach(row => {
          let rowStr = ""
          row.forEach(cell => {
            rowStr += cell.hidden ? `<a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/minesweeper/click?x=${cell.x}&y=${cell.y}">${cell.toEmoji()}</a>` : `<span>${cell.toEmoji()}</span>`
          })
          str += rowStr + "<br>"
        })
        str += `</p>`
        str += `<p align="center"><img width="256" src="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/minesweeper.gif" /></p>`
        if(this.minesweeper.gameStatus === "Not Started") str += `<p align="center">Come on, try it</p>`
        else if(this.minesweeper.gameStatus === "Started") str += `<p align="center">Keep clearing, there are still many mines left.</p>`
        else str += this.minesweeper.gameLoosed ? `<p align="center">You lost don't hesitate to try again</p>` : `<p align="center">Congrats you won !</p>`
  
        str += `<h3 align="center"><a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/minesweeper/new">Reset Game</a></h3>`
    
        return str
      }
}

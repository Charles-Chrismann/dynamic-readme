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

    /**
     * @param x 
     * @param y 
     * @returns true if the map has been updated false otherwise
     */
    click(x: number, y: number): boolean {
        if(!this.minesweeper) this.minesweeper = new Minesweeper(18, 14, 24);
        if(this.minesweeper.gameStatus === "Ended") return false
        if(!this.minesweeper.HandleClick({x: x, y: y})) return false
        if(this.minesweeper.map.flat().filter(cell => cell.hidden).length === this.minesweeper.bombsCount) this.minesweeper.gameStatus = "Endend"
        this.history.push(this.renderGameImageCtx())
        return true
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
        let str = `<h3 align="center">A classic Minesweeper</h3>\n`
        str += `<p align="center">\n`
        str += this.minesweeper.map.map(row => `${row.map(cell => cell.hidden ? `  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/minesweeper/click?x=${cell.x}&y=${cell.y}">${cell.toEmoji()}</a>\n` : `  <span>${cell.toEmoji()}</span>\n`).join('')}`).join('  <br>\n')
        str += `</p>\n`
        if(this.minesweeper.gameStatus === "Not Started") str += `<p align="center">Come on, try it</p>\n`
        else if(this.minesweeper.gameStatus === "Started") str += `<p align="center">Keep clearing, there are still many mines left.</p>\n`
        else str += this.minesweeper.gameLoosed ? `<p align="center">You lost don't hesitate to try again</p>\n` : `<p align="center">Congrats you won !</p>\n`
        
        if(this.history.length > 1) str += `<p align="center">\n  <img width="256" src="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/minesweeper.gif" />\n</p>`
  
        str += `<h3 align="center">\n  <a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/minesweeper/new">Reset Game</a>\n</h3>\n\n<hr>\n\n`
    
        return str
      }
}

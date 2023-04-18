import { Injectable } from '@nestjs/common';
import { Minesweeper } from './classes/Minesweeper';

@Injectable()
export class MinesweeperService {
    minesweeper: Minesweeper

    constructor() {
      this.minesweeper = new Minesweeper(18, 14, 24)
    }

    new() {
        this.minesweeper = new Minesweeper(18, 14, 24)
    }

    click(x: number, y: number) {
        if(!this.minesweeper) this.minesweeper = new Minesweeper(18, 14, 24);
        this.minesweeper.HandleClick({x: x, y: y})
        if(this.minesweeper.map.flat().filter(cell => cell.hidden).length === this.minesweeper.bombsCount) this.minesweeper.gameStatus = "Endend"
    }

    toMd() {
        let str = `<h3 align="center">A classic Minesweeper</h3>`
        str += `<p align="center">`
        this.minesweeper.map.forEach(row => {
          let rowStr = ""
          row.forEach(cell => {
            if(this.minesweeper.gameLoosed) {
              this.minesweeper.map.flat().filter(cell => cell.value === 9).forEach(cell => cell.hidden = false)
            }
            rowStr += cell.hidden ? `<a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/minesweeper/click?x=${cell.x}&y=${cell.y}">${cell.toEmoji()}</a>` : `<span>${cell.toEmoji()}</span>`
          })
          str += rowStr + "<br>"
        })
        str += `</p>`
        if(this.minesweeper.gameStatus === "Not Started") str += `<p align="center">Come on, try it</p>`
        else if(this.minesweeper.gameStatus === "Started") str += `<p align="center">Keep clearing, there are still many mines left.</p>`
        else str += this.minesweeper.gameLoosed ? `<p align="center">You lost don't hesitate to try again</p>` : `<p align="center">Congrats you won !</p>`
  
        str += `<h3 align="center"><a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/minesweeper/new">Reset Game</a></h3>`
    
        return str
      }
}

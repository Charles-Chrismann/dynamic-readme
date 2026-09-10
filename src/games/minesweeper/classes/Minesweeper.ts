import { Cell } from "./Cell";
import type { Minesweeper as MinesweeperType } from '../../../zod.zodobject'

type Click = {
  x: number
  y: number
}

export class Minesweeper {
    height!: number;
    width!: number;
    bombsCount!: number;
    map: Cell[][] = [];
    gameStatus: 'Not Started' | 'Running' | 'Ended' = 'Not Started'
    gameLoosed = false;
    history: [number, number][] = []
    // constructor(...setup: [Record<string, any>] | [number, number, number]) {
    //   if(setup.length === 1) {
    //     const json = setup.shift()
    //       Object.assign(this, json)
    //       this.map = json.map.map(row => row.map(cell => new Cell(cell.x, cell.y, cell.value, cell.hidden)))
    //     return this
    //   }

    //   this.width = setup.shift();
    //   this.height = setup.shift();
    //   this.bombsCount = setup.shift();
    //   this.CreateEmptyMap();
    //   return this
    // }

    init({ height, width, bombsCount }: {
      height: number
      width: number
      bombsCount: number
    }) {
      this.width = width;
      this.height = height;
      this.bombsCount = bombsCount;
      this.history = []
      this.CreateEmptyMap();
      return this
    }

    createFromSave(saveData: MinesweeperType) {
      const { map, history } = saveData

      this.height = this.map.length
      this.width = this.map[0].length
      this.bombsCount = 0
      this.gameStatus = 'Not Started'
      this.gameLoosed = false
      this.history = history

      this.map = map.map(row =>
        row.map(cell => {
          const { x, y, value, hidden } = cell
          if(this.gameStatus === 'Not Started' && !hidden) this.gameStatus = 'Running'
          if(value === 9 && !hidden) {
            this.bombsCount++
            this.gameLoosed = true
            this.gameStatus = 'Ended'
          }
          return new Cell(x, y, value, hidden)
        })
      )

      return this
    }
  
    CreateEmptyMap() {
      for(let i = 0; i < this.height; i++) {
        let row: Cell[] = []
        for(let j = 0; j < this.width; j++) {
          row.push(new Cell(j, i, 0))
        }
        this.map.push(row)
      }
    }
  
    CellExists(CellCoords: Click) {
      return CellCoords.x >= 0 && CellCoords.x < this.width && CellCoords.y >= 0 && CellCoords.y < this.height
    }
  
    GetCell(click: Click) {
      return this.CellExists(click) ? this.map[click.y][click.x] : null
    }
  
    handleClick(click: Click): boolean {
      if(this.gameStatus === 'Not Started') {
        this.placeBombs(click);
        this.gameStatus = 'Running';
        let cell = this.GetCell(click)
        if(!cell) return false
        this.DiscoverRecursively(cell)
      } else if (this.gameStatus === 'Running') {
        let cell = this.GetCell(click)
        if(!cell) return false
        if(cell.value === 9) {
          this.reavealAllBombs()
          this.gameLoosed = true;// loose
          this.gameStatus = "Ended";// loose
          return true
        } else if(!cell.hidden) {
          return false
        }
        this.DiscoverRecursively(cell)
      } else if(this.gameStatus === 'Ended') return false
      return true
    }
  
    placeBombs(click: Click) {
      let possibleBombsSpawns: Cell[][] = []
      this.map.forEach(row => {
        let rowToPush: Cell[] = []
        row.forEach(cell => {
          rowToPush.push(cell)
        })
        possibleBombsSpawns.push(rowToPush)
      })
      
      // tops 
      if(this.CellExists({x: click.x - 1, y: click.y - 1})) possibleBombsSpawns[click.y - 1].splice(click.x - 1, 1)  // Splice modifie la longueur de la chaine donc click.x each time
      if(this.CellExists({x: click.x, y: click.y - 1})) possibleBombsSpawns[click.y - 1].splice(click.x - 1, 1)  // Splice modifie la longueur de la chaine donc click.x each time
      if(this.CellExists({x: click.x + 1, y: click.y - 1})) possibleBombsSpawns[click.y - 1].splice(click.x - 1, 1)  // Splice modifie la longueur de la chaine donc click.x each time
  
      // mids
      if(this.CellExists({x: click.x - 1, y: click.y})) possibleBombsSpawns[click.y].splice(click.x - 1, 1)
      if(this.CellExists({x: click.x, y: click.y})) possibleBombsSpawns[click.y].splice(click.x - 1, 1)
      if(this.CellExists({x: click.x + 1, y: click.y})) possibleBombsSpawns[click.y].splice(click.x - 1, 1)
  
      // bots
      if(this.CellExists({x: click.x - 1, y: click.y + 1})) possibleBombsSpawns[click.y + 1].splice(click.x - 1, 1)
      if(this.CellExists({x: click.x, y: click.y + 1})) possibleBombsSpawns[click.y + 1].splice(click.x - 1, 1)
      if(this.CellExists({x: click.x + 1, y: click.y + 1})) possibleBombsSpawns[click.y + 1].splice(click.x - 1, 1)
      
      let possibleBombsSpawnsFlat = possibleBombsSpawns.flat().sort((a, b) => 0.5 - Math.random());
      let bombCells = possibleBombsSpawnsFlat.splice(0, this.bombsCount)
  
      bombCells.forEach(bombCell => {
        this.map[bombCell.y][bombCell.x].value = 9
  
        if(this.map[bombCell.y - 1]) {
          if(this.map[bombCell.y - 1][bombCell.x - 1]) {
            if(this.map[bombCell.y - 1][bombCell.x - 1].value !== 9) this.map[bombCell.y - 1][bombCell.x - 1].value++
          }
        }
  
        if(this.map[bombCell.y - 1]) {
          if(this.map[bombCell.y - 1][bombCell.x]) {
            if(this.map[bombCell.y - 1][bombCell.x].value !== 9) this.map[bombCell.y - 1][bombCell.x].value++
          }
        }
  
        if(this.map[bombCell.y - 1]) {
          if(this.map[bombCell.y - 1][bombCell.x + 1]) {
            if(this.map[bombCell.y - 1][bombCell.x + 1].value !== 9) this.map[bombCell.y - 1][bombCell.x + 1].value++
          }
        }
  
  
  
        if(this.map[bombCell.y]) {
          if(this.map[bombCell.y][bombCell.x - 1]) {
            if(this.map[bombCell.y][bombCell.x - 1].value !== 9) this.map[bombCell.y][bombCell.x - 1].value++
          }
        }
  
        if(this.map[bombCell.y]) {
          if(this.map[bombCell.y][bombCell.x + 1]) {
            if(this.map[bombCell.y][bombCell.x + 1].value !== 9) this.map[bombCell.y][bombCell.x + 1].value++
          }
        }
  
        if(this.map[bombCell.y + 1]) {
          if(this.map[bombCell.y + 1][bombCell.x - 1]) {
            if(this.map[bombCell.y + 1][bombCell.x - 1].value !== 9) this.map[bombCell.y + 1][bombCell.x - 1].value++
          }
        }
  
        if(this.map[bombCell.y + 1]) {
          if(this.map[bombCell.y + 1][bombCell.x]) {
            if(this.map[bombCell.y + 1][bombCell.x].value !== 9) this.map[bombCell.y + 1][bombCell.x].value++
          }
        }
  
        if(this.map[bombCell.y + 1]) {
          if(this.map[bombCell.y + 1][bombCell.x + 1]) {
            if(this.map[bombCell.y + 1][bombCell.x + 1].value !== 9) this.map[bombCell.y + 1][bombCell.x + 1].value++
          }
        }
      })
    }
  
    DiscoverRecursively(cell: Cell) {
      cell.revealCell()
      if(cell.value !== 0) return // evite si click au hasard sur un 5 de reveal les 0 a coté, + en recursif les numéro ne doivent pas montrer leurs siblibgs
  
      let nextCell: Cell | null;
      let cellCoordsToTest;
  
      // top left
      cellCoordsToTest = {x: cell.x - 1, y: cell.y - 1}
      if(this.CellExists(cellCoordsToTest)) {
        nextCell = this.GetCell(cellCoordsToTest)
        if(nextCell?.hidden) this.DiscoverRecursively(nextCell)
      }
  
      // top
      cellCoordsToTest = {x: cell.x, y: cell.y - 1}
      if(this.CellExists(cellCoordsToTest)) {
        nextCell = this.GetCell(cellCoordsToTest)
        if(nextCell?.hidden) this.DiscoverRecursively(nextCell)
      }
  
      // top right
      cellCoordsToTest = {x: cell.x + 1, y: cell.y - 1}
      if(this.CellExists(cellCoordsToTest)) {
        nextCell = this.GetCell(cellCoordsToTest)
        if(nextCell?.hidden) this.DiscoverRecursively(nextCell)
      }
  
      // left
      cellCoordsToTest = {x: cell.x - 1, y: cell.y}
      if(this.CellExists(cellCoordsToTest)) {
        nextCell = this.GetCell(cellCoordsToTest)
        if(nextCell?.hidden) this.DiscoverRecursively(nextCell)
      }
  
      // right
      cellCoordsToTest = {x: cell.x + 1, y: cell.y}
      if(this.CellExists(cellCoordsToTest)) {
        nextCell = this.GetCell(cellCoordsToTest)
        if(nextCell?.hidden) this.DiscoverRecursively(nextCell)
      }
  
      // bot left
      cellCoordsToTest = {x: cell.x - 1, y: cell.y + 1}
      if(this.CellExists(cellCoordsToTest)) {
        nextCell = this.GetCell(cellCoordsToTest)
        if(nextCell?.hidden) this.DiscoverRecursively(nextCell)
      }
  
      // bot
      cellCoordsToTest = {x: cell.x, y: cell.y + 1}
      if(this.CellExists(cellCoordsToTest)) {
        nextCell = this.GetCell(cellCoordsToTest)
        if(nextCell?.hidden) this.DiscoverRecursively(nextCell)
      }
  
      // bot right
      cellCoordsToTest = {x: cell.x + 1, y: cell.y + 1}
      if(this.CellExists(cellCoordsToTest)) {
        nextCell = this.GetCell(cellCoordsToTest)
        if(nextCell?.hidden) this.DiscoverRecursively(nextCell)
      }
    }

    reavealAllBombs() {
      this.map.flat().filter(cell => cell.value === 9 && cell.hidden).forEach(cell => cell.revealCell())
    }
}
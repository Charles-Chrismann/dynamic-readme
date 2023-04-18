import { Piece } from './Piece'
import { utils } from './utils'

export class Bishop extends Piece {
  type = 'Bishop'

  computeLegalMoves(chessInstance, board) {
    // console.log('computeLegalMoves Bishop')
    this.legalMoves = [];
    // TODO Check discover check
    // TODO Check borders
    // TODO Check piece devant
    let caseCoords = {x: this.x, y: this.y}
    // top left
    while(--caseCoords.x >= 0 && --caseCoords.y >= 0) {
      if(board[caseCoords.y][caseCoords.x]?.color === (this.color === 'white' ? 'white' : 'black')) break;
      this.legalMoves.push({...caseCoords})
      if(board[caseCoords.y][caseCoords.x]?.color === (this.color === 'white' ? 'black' : 'white')) break;
    }
    
    caseCoords = {x: this.x, y: this.y}
    // bottom right
    while(++caseCoords.x <= 7 && ++caseCoords.y <= 7) {
      if(board[caseCoords.y][caseCoords.x]?.color === (this.color === 'white' ? 'white' : 'black')) break;
      this.legalMoves.push({...caseCoords})
      if(board[caseCoords.y][caseCoords.x]?.color === (this.color === 'white' ? 'black' : 'white')) break;
    }


    caseCoords = {x: this.x, y: this.y}
    // top right
    while(++caseCoords.x <= 7 && --caseCoords.y >= 0) {
      if(board[caseCoords.y][caseCoords.x]?.color === (this.color === 'white' ? 'white' : 'black')) break;
      this.legalMoves.push({...caseCoords})
      if(board[caseCoords.y][caseCoords.x]?.color === (this.color === 'white' ? 'black' : 'white')) break;
    }

    caseCoords = {x: this.x, y: this.y}
    // bottom left
    while(--caseCoords.x >= 0 && ++caseCoords.y <= 7) {
      if(board[caseCoords.y][caseCoords.x]?.color === (this.color === 'white' ? 'white' : 'black')) break;
      this.legalMoves.push({...caseCoords})
      if(board[caseCoords.y][caseCoords.x]?.color === (this.color === 'white' ? 'black' : 'white')) break;
    }

    if(chessInstance.simulationState) return
    chessInstance.simulationState = true
    this.legalMoves = utils.filterPin(this.legalMoves, {x: this.x, y: this.y}, board, chessInstance)
    chessInstance.simulationState = false
  }
}
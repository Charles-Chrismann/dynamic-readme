import { utils } from './utils';
import { Piece } from './Piece';

export class Rook extends Piece {
  type = 'Rook'
  uniqueInitial= 'r';

  computeLegalMoves(chessInstance, board) {
    this.legalMoves = [];
    // TODO Check discover check
    // TODO Check borders
    // TODO Check piece devant
    for(let x = this.x - 1; x >= 0; x--) {
      if(board[this.y][x]?.color === (this.color === 'white' ? 'white' : 'black')) break;
      this.legalMoves.push({x: x, y: this.y})
      if(board[this.y][x]?.color === (this.color === 'white' ? 'black' : 'white')) break;
    }
    for(let x = this.x + 1; x <= 7; x++) {
      if(board[this.y][x]?.color === (this.color === 'white' ? 'white' : 'black')) break;
      this.legalMoves.push({x: x, y: this.y})
      if(board[this.y][x]?.color === (this.color === 'white' ? 'black' : 'white')) break;
    }

    for(let y = this.y - 1; y >= 0; y--) {
      if(board[y][this.x]?.color === (this.color === 'white' ? 'white' : 'black')) break;
      this.legalMoves.push({x: this.x, y: y})
      if(board[y][this.x]?.color === (this.color === 'white' ? 'black' : 'white')) break;
    }
    for(let y = this.y + 1; y <= 7; y++) {
      if(board[y][this.x]?.color === (this.color === 'white' ? 'white' : 'black')) break;
      this.legalMoves.push({x: this.x, y: y})
      if(board[y][this.x]?.color === (this.color === 'white' ? 'black' : 'white')) break;
    }

    if(chessInstance.simulationState) return
    chessInstance.simulationState = true
    this.legalMoves = utils.filterPin(this.legalMoves, {x: this.x, y: this.y}, board, chessInstance)
    chessInstance.simulationState = false
  }
}
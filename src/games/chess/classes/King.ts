import { Piece } from './Piece'
import { Rook } from './Rook'
import { utils } from './utils'

export class King extends Piece {
  type = 'King'
  uniqueInitial = 'k'
  moved = false

  computeLegalMoves(chessInstance, board) {
    this.legalMoves = [];
      
    let cases = [
      {x: this.x - 1, y: this.y - 1},
      {x: this.x, y: this.y - 1},
      {x: this.x + 1, y: this.y - 1},
      {x: this.x - 1, y: this.y},
      {x: this.x + 1, y: this.y},
      {x: this.x - 1, y: this.y + 1},
      {x: this.x, y: this.y + 1},
      {x: this.x + 1, y: this.y + 1},
    ]

    cases.forEach(caseSingle => {
      if(caseSingle.x < 0 || caseSingle.x > 7 || caseSingle.y < 0 || caseSingle.y > 7) return
      let antiKingCases = [
        {x: caseSingle.x - 1, y: caseSingle.y - 1},
        {x: caseSingle.x, y: caseSingle.y - 1},
        {x: caseSingle.x + 1, y: caseSingle.y - 1},
        {x: caseSingle.x - 1, y: caseSingle.y},
        {x: caseSingle.x + 1, y: caseSingle.y},
        {x: caseSingle.x - 1, y: caseSingle.y + 1},
        {x: caseSingle.x, y: caseSingle.y + 1},
        {x: caseSingle.x + 1, y: caseSingle.y + 1},
      ]
      let antiKingCasesStatus = true

      antiKingCases.forEach(antiKingCase => {
        if(utils.getPiece({x: antiKingCase.x, y: antiKingCase.y}, board) instanceof King && utils.getPiece({x: antiKingCase.x, y: antiKingCase.y}, board).color !== this.color) {
          antiKingCasesStatus = false
          return
        }
      })
      if(!antiKingCasesStatus) return
      if(!(board[caseSingle.y][caseSingle.x]?.color === (this.color === 'white' ? 'white' : 'black'))) this.legalMoves.push(caseSingle)  
    })
    
    if(chessInstance.simulationState) return
    chessInstance.simulationState = true
    // check castle
    if(!this.moved) {
      if(
          !board[this.y][this.x + 1]
          && utils.whoControlsThisCase({x: this.x + 1, y: this.y}, board).filter(piece => piece.color !== this.color).length === 0
          && !board[this.y][this.x + 2]
          && utils.whoControlsThisCase({x: this.x + 2, y: this.y}, board).filter(piece => piece.color !== this.color).length === 0
          && !board[this.y][this.x + 3]?.moved
          && utils.whoControlsThisCase({x: this.x + 3, y: this.y}, board).filter(piece => piece.color !== this.color).length === 0
        ) this.legalMoves.push({x: this.x + 2, y: this.y})
      // long castle
      if(
        !board[this.y][this.x + 1]
        && utils.whoControlsThisCase({x: this.x - 1, y: this.y}, board).filter(piece => piece.color !== this.color).length === 0
        && !board[this.y][this.x + 2]
        && utils.whoControlsThisCase({x: this.x - 2, y: this.y}, board).filter(piece => piece.color !== this.color).length === 0
        && !board[this.y][this.x - 3]
        && utils.whoControlsThisCase({x: this.x - 3, y: this.y}, board).filter(piece => piece.color !== this.color).length === 0
        && !board[this.y][this.x - 4]?.moved
        && utils.whoControlsThisCase({x: this.x - 4, y: this.y}, board).filter(piece => piece.color !== this.color).length === 0
      ) this.legalMoves.push({x: this.x + 2, y: this.y})


      if(!board[this.y][this.x - 1] && !board[this.y][this.x - 2] && !board[this.y][this.x - 3] && !board[this.y][this.x - 4]?.moved && board[this.y][this.x - 4] instanceof Rook) this.legalMoves.push({x: this.x - 2, y: this.y})
    }

    this.legalMoves = utils.filterPin(this.legalMoves, {x: this.x, y: this.y}, board, chessInstance)
    chessInstance.simulationState = false
  }
}
import { Piece } from './Piece';
import { utils } from './utils';

export class Knight extends Piece {
    type = 'Knight'
    uniqueInitial = 'n'

    computeLegalMoves(chessInstance, board) {
        this.legalMoves = [];
        // TODO Check discover check
        // TODO Check borders
        // TODO Check piece devant
        if(this.y + 2 <= 7) {
            if(this.x - 1 >= 0) {
                if(!(utils.getPiece({x: this.x - 1, y: this.y + 2}, board)?.color === this.color)) this.legalMoves.push({x: this.x - 1, y: this.y + 2})
            }
            if(this.x + 1 <= 7) {
                if(!(utils.getPiece({x: this.x + 1, y: this.y + 2}, board)?.color === this.color)) this.legalMoves.push({x: this.x + 1, y: this.y + 2})
            }
        }

        if(this.y - 2 >= 0) {
            if(this.x - 1 >= 0) {
                if(!(utils.getPiece({x: this.x - 1, y: this.y - 2}, board)?.color === this.color)) this.legalMoves.push({x: this.x - 1, y: this.y - 2})
            }
            if(this.x + 1 <= 7) {
                if(!(utils.getPiece({x: this.x + 1, y: this.y - 2}, board)?.color === this.color)) this.legalMoves.push({x: this.x + 1, y: this.y - 2})
            }
        }

        if(this.x - 2 >= 0) {
            if(this.y - 1 >= 0) {
                if(!(utils.getPiece({x: this.x - 2, y: this.y - 1}, board)?.color === this.color)) this.legalMoves.push({x: this.x - 2, y: this.y - 1})
            }
            if(this.y + 1 <= 7) {
                if(!(utils.getPiece({x: this.x - 2, y: this.y + 1}, board)?.color === this.color)) this.legalMoves.push({x: this.x - 2, y: this.y + 1})
            }
        }

        if(this.x + 2 <= 7) {
            if(this.y - 1 >= 0) {
                if(!(utils.getPiece({x: this.x + 2, y: this.y - 1}, board)?.color === this.color)) this.legalMoves.push({x: this.x + 2, y: this.y - 1})
            }
            if(this.y + 1 <= 7) {
                if(!(utils.getPiece({x: this.x + 2, y: this.y + 1}, board)?.color === this.color)) this.legalMoves.push({x: this.x + 2, y: this.y + 1})
            }
        }

        if(chessInstance.simulationState) return
        chessInstance.simulationState = true
        this.legalMoves = utils.filterPin(this.legalMoves, {x: this.x, y: this.y}, board, chessInstance)
        chessInstance.simulationState = false
    }
}
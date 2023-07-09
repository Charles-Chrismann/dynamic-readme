import { utils } from './utils';
import { Piece } from './Piece';

export class Pawn extends Piece {
    type = 'Pawn';
    uniqueInitial = 'p';
    enPassantPossible = false
    moved = false;

    computeLegalMoves(chessInstance, board) {
        this.legalMoves = [];
        // TODO Check discover check
        // TODO Check borders
        // TODO Check en passant
        // TODO Check prise de piece
        // TODO Check promotion
        
        // TODO refactor avec direction = +/-1
        let direction = this.color === 'white' ? - 1 : 1

        if(!this.moved && !utils.getPiece({x: this.x, y: this.color === 'white' ? this.y - 1 : this.y + 1}, board)) {
            if(!utils.getPiece({x: this.x, y: this.color === 'white' ? this.y - 2 : this.y + 2}, board))this.legalMoves.push({x: this.x, y: this.color === 'white' ? this.y - 2 : this.y + 2}) // 'white' = directions des pions
        }
        if(!utils.getPiece({x: this.x, y: this.color === 'white' ? this.y - 1 : this.y + 1}, board)) this.legalMoves.push({x: this.x, y: this.color === 'white' ? this.y - 1 : this.y + 1})
        if(utils.getPiece({x: this.x + 1, y: this.color === 'white' ? this.y - 1 : this.y + 1}, board)) {
            if(utils.getPiece({x: this.x + 1, y: this.color === 'white' ? this.y - 1 : this.y + 1}, board).color !== this.color) this.legalMoves.push({x: this.x + 1, y: this.color === 'white' ? this.y - 1 : this.y + 1})
        }
        if(utils.getPiece({x: this.x - 1, y: this.color === 'white' ? this.y - 1 : this.y + 1}, board)) {
            if(utils.getPiece({x: this.x - 1, y: this.color === 'white' ? this.y - 1 : this.y + 1}, board).color !== this.color) this.legalMoves.push({x: this.x - 1, y: this.color === 'white' ? this.y - 1 : this.y + 1})
        }
        
        let enPassantPieceToCheck = utils.getPiece({x: this.x - 1, y: this.y}, board)
        if(enPassantPieceToCheck?.type === 'Pawn' && enPassantPieceToCheck?.enPassantPossible && enPassantPieceToCheck?.color !== this.color) {
            this.legalMoves.push({x: this.x - 1, y: this.y + direction})
        }

        enPassantPieceToCheck = utils.getPiece({x: this.x + 1, y: this.y}, board)
        if(enPassantPieceToCheck?.type === 'Pawn' && enPassantPieceToCheck?.enPassantPossible && enPassantPieceToCheck?.color !== this.color) {
            this.legalMoves.push({x: this.x + 1, y: this.y + direction})
        }
        
        if(chessInstance.simulationState) return
        chessInstance.simulationState = true
        this.legalMoves = utils.filterPin(this.legalMoves, {x: this.x, y: this.y}, board, chessInstance)
        chessInstance.simulationState = false
    }
}
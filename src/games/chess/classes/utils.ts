import { cloneDeep } from 'lodash';

export class utils {
    static getAllPieces(board) {
        return board.flat().filter(piece => piece)
    }

    static getPiece(targetCoords, board) {
        return this.getAllPieces(board).find(piece => piece.x === targetCoords.x && piece.y === targetCoords.y)
    }

    static filterPin(legalMoves, currentPosition, board, chessInstance) {
        return legalMoves.filter(move => {
            let nextPosition = this.computeNextPosition(currentPosition, move, board)
            this.defineAllLegalMoves(chessInstance, nextPosition)
            return this.isKingChecked(this.getMyKing(this.getPiece(move, nextPosition), nextPosition), nextPosition).length === 0
        })
    }

    static getMyKing(pieceInstance, board) {
        return this.getAllPieces(board).find(piece => piece.color === pieceInstance.color && piece.type === 'King')
    }

    static getKingOfColor(color, board) {
        return this.getAllPieces(board).find(piece => piece.color === color && piece.type === 'King')
    }

    static isKingChecked(king, board) {
        return this.getAllPieces(board).filter(piece => piece.legalMoves.filter(move => move.x === king.x && move.y === king.y).length !== 0 && piece.color !== king.color)
    }
    
    static whoControlsThisCase(CaseCoords, board) {
        return this.getAllPieces(board).filter(piece => piece.legalMoves.filter(move => move.x === CaseCoords.x && move.y === CaseCoords.y).length > 0)
    }
    
    static computeNextPosition(pieceToMoveCoords, destinationCoords, board) {
        board = cloneDeep(board)
        let pieceToMove = board[pieceToMoveCoords.y][pieceToMoveCoords.x]
        pieceToMove.x = destinationCoords.x
        pieceToMove.y = destinationCoords.y
        board[pieceToMoveCoords.y][pieceToMoveCoords.x] = null
        board[destinationCoords.y][destinationCoords.x] = pieceToMove
        return board
    }
    
    static defineAllLegalMoves(chessInstance, board) {
        let enPassant = this.getAllPieces(board).find(piece => piece?.enPassantPossible && piece.color === chessInstance.playerTurn)
        if(enPassant) enPassant.enPassantPossible = false
        
        this.getAllPieces(board).forEach(piece => {
          if(piece.type === 'King') return
            piece.computeLegalMoves(chessInstance, board)
        });
        this.getAllPieces(board).filter(piece => piece.type === 'King').forEach(king => {
          king.computeLegalMoves(chessInstance, board)
        });
    }
    
    static getPlayerMovesCount(chessInstance) {
        console.log()
        return  this.getAllPieces(chessInstance.board)
                .filter(piece => piece.color === chessInstance.playerTurn)
                .map(piece => piece.legalMoves)
                .flat().length
    }
    
    static toString(board) {
        console.log("---------------------------------")
        board.forEach(row => {
            row = row.map(item => item ? item.type : " ")
            let str = "| "
            row.forEach(item => {
              str += item.charAt(0) + " | "
            })
            console.log(str)
            console.log("---------------------------------")
        })
        return
    }

    static coordsToBoardCoards(coords){
        let alphabet = "abcdefgh"
        return `${alphabet[coords.x]}${8 - coords.y}`
    }

    static getletterFromNumber(number) {
        let numbers = [
                ":eight:",
                ":seven:",
                ":six:",
                ":five:",
                ":four:",
                ":three:",
                ":two:",
                ":one:",
            ]
        return numbers[number]
    }
}






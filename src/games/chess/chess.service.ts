import { Injectable } from '@nestjs/common';
import { Chess } from './classes/Chess';
import { utils } from './classes/utils';

@Injectable()
export class ChessService {
    constructor() {
        this.chess = new Chess()
    }
    chess: Chess
    pieces = {
        Pawn: {
            white: "♙",
            black: "♟",
        },
        King: {
            white: "♔",
            black: "♚",
        },
        Queen: {
            white: "♕",
            black: "♛",
        },
        Rook: {
            white: "♖",
            black: "♜",
        },
        Knight: {
            white: "♘",
            black: "♞",
        },
        Bishop: {
            white: "♗",
            black: "♝",
        },
    }

    new() {
        this.chess = new Chess()
    }

    move(req) {
        this.chess.updateBoard({x: +req.query.x1, y: +req.query.y1},{x: +req.query.x2, y: +req.query.y2})
    }

    toMd() {
        let str = `<h3 align="center">A classic Chess</h3>`
        str += `<p align="center">`
        this.chess.board.forEach((row, rowIndex) => {
            let rowStr = "<span>"
            row.forEach((cell, cellIndex) => {
                if(cell) rowStr+= `<span>${this.pieces[cell.type][cell.color]}</span>      `
                else {
                    if(rowIndex % 2 === 0) rowStr+= cellIndex % 2 === 0 ? ":white_large_square:" : ":green_square:"
                    else rowStr+= cellIndex % 2 === 0 ? ":green_square:" : ":white_large_square:"
                }
            })
            str += rowStr + "</span><br>"
          })
        str += `</p>`
        utils.getAllPieces(this.chess.board).filter(piece => piece.color === this.chess.playerTurn).forEach(piece => {
            if(piece.legalMoves.length === 0) return
            let pieceStr = "<p>" + this.pieces[piece.type][piece.color] + utils.coordsToBoardCoards({x: piece.x, y: piece.y}) + ": "
            piece.legalMoves.forEach(move => {
                pieceStr += `<a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/chess/move?x1=${piece.x}&y1=${piece.y}&x2=${move.x}&y2=${move.y}">${utils.coordsToBoardCoards({x: move.x, y: move.y})}</a> `
            })
            str += pieceStr + "</p>"
        })
        str += `<h3 align="center"><a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/chess/new">Reset Game</a></h3>`
        return str
    }
}

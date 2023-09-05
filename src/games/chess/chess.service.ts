import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { createCanvas, loadImage } from 'canvas';
import { Chess } from './classes/Chess';
import { utils } from './classes/utils';
import { Piece } from './classes/Piece';

@Injectable()
export class ChessService {
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

    constructor() {
        this.chess = new Chess()
    }

    new() {
        this.chess = new Chess()
    }

    move(req) {
        this.chess.updateBoard({x: +req.query.x1, y: +req.query.y1},{x: +req.query.x2, y: +req.query.y2})
    }

    async renderBoardImage() {
        const tileSize = 32;
        const buffer = (await (async () => {
            const canvas = createCanvas(256, 256)
            const ctx = canvas.getContext('2d')
            ctx.fillStyle = '#eeeed2'
            ctx.fillRect(0, 0, 256, 256)
            
            ctx.fillStyle = '#769656'
            
            let currentColor;
            for (let i = 0; i < 8; i++) {
              for (let j = 0; j < 8; j++) {
                if ((i + j) % 2 === 0) {
                    ctx.fillRect(tileSize * i, tileSize * j, tileSize, tileSize)
                }

                if(j === 7) {
                    currentColor = ctx.fillStyle
                    ctx.fillStyle = i % 2 === 0 ? '#769656' : '#eeeed2'
                    ctx.fillText(String.fromCharCode(97 + i), tileSize * (i + 1) - 6, 253)
                    ctx.fillStyle = currentColor
                }
              }
              currentColor = ctx.fillStyle
              ctx.fillStyle = i % 2 !== 0 ? '#769656' : '#eeeed2'
              ctx.fillText(String(8 - i), 1, tileSize * (i + 1) - 24)
              ctx.fillStyle = currentColor
            }
        
            
          
            utils.getAllPieces(this.chess.board).forEach(async piece => {
                ctx.drawImage(await loadImage('./src/games/chess/assets/' + piece.getImage() + '.png'), piece.x * tileSize, piece.y * tileSize, tileSize, tileSize)
            })
        
            return canvas
        })()).toBuffer('image/png')
        fs.writeFileSync('./public/board.png', buffer)
    }

    private computeMoveString(piece: Piece) {
        const sqrt = Math.ceil(Math.sqrt(piece.legalMoves.length))
        return piece.legalMoves.map((move, index: number) => {
            return `${(index % sqrt === 0 && index !== 0) ? "<br>" : ''}<a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/chess/move?x1=${piece.x}&y1=${piece.y}&x2=${move.x}&y2=${move.y}">${utils.coordsToBoardCoards({x: move.x, y: move.y})}</a>`
        }).join('\n          ')
    }

    toMd() {
        let str = `<h3 align="center">A classic Chess</h3>\n`
        this.renderBoardImage()
        str += `<p align="center">\n  <img width="256" src="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/board.png" />\n</p>\n`

        if( this.chess.status === "black" ||
            this.chess.status === "white"
            ) str += `<p align="center">${this.chess.status.charAt(0).toUpperCase() + this.chess.status.slice(1)} wins !</p>\n`
        else if(this.chess.status === "tie") str += `<p align="center">Stalemate !</p>\n`
        else str += `<p align="center">It's ${this.chess.playerTurn.charAt(0).toUpperCase() + this.chess.playerTurn.slice(1)}'s turn</p>\n`

        if(!this.chess.status) {
            str += `<table align="center">\n  <tbody>\n`
            this.chess.board.forEach((row, y) => {
                str += `    <tr>\n      <td align="center">${utils.getletterFromNumber(y)}</td>\n`
                row.forEach((piece) => {
                    str += `      <td align="center">${piece ? (piece.legalMoves.length && piece.color === this.chess.playerTurn ? `\n        <details>\n          <summary>${this.pieces[piece.type][piece.color]}</summary>\n          ${this.computeMoveString(piece)}\n        </details>\n` : this.pieces[piece.type][piece.color]
                ): "‎ "}      </td>\n`
                })
                str += `    </tr>\n`
            })
            
            str +=  `  <tr>\n    <td align="center"></td>\n    <td align="center">🇦</td>\n    <td align="center">🇧</td>\n    <td align="center">🇨</td>\n    <td align="center">🇩</td>\n    <td align="center">🇪</td>\n    <td align="center">🇫</td>\n    <td align="center">🇬</td>\n    <td align="center">🇭</td>\n    </tr>\n  </tbody>\n</table>`
        }

        str += `<h3 align="center">\n<a href="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/chess/new">Reset Game</a>\n</h3>\n\n<hr>\n\n`
        return str
    }
}

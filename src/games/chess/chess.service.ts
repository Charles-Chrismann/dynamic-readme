import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { createCanvas, loadImage } from 'canvas';
import { Chess } from './classes/Chess';
import { utils } from './classes/utils';

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

    toMd() {
        let str = `<h3 align="center">A classic Chess</h3>`
        this.renderBoardImage()
        str += `<p align="center"><img width="256" src="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/board.png" /></p>`

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

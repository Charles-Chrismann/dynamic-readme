import cloneDeep from 'lodash/cloneDeep';
import { utils } from './utils';

import { Pawn } from './Pawn';
import { Bishop } from './Bishop';
import { Knight } from './Knight';
import { Rook } from './Rook';
import { Queen } from './Queen';
import { King } from './King';

export class Chess {
  board; // white pov
  playerTurn = 'white'
  simulationState = false
  status = null // null: game en cours | pat: tie | white/black: winner
  constructor() {
    this.createBoard()
    utils.defineAllLegalMoves(this, this.board)
  }

  createBoard() {
    this.board = [
      [
        new Rook(0, 0, 'black'),
        new Knight(1, 0, 'black'),
        new Bishop(2, 0, 'black'),
        new Queen(3, 0, 'black'),
        new King(4, 0, 'black'),
        new Bishop(5, 0, 'black'),
        new Knight(6, 0, 'black'),
        new Rook(7, 0, 'black'),
      ],
      [
        new Pawn(0, 1, 'black'),
        new Pawn(1, 1, 'black'),
        new Pawn(2, 1, 'black'),
        new Pawn(3, 1, 'black'),
        new Pawn(4, 1, 'black'),
        new Pawn(5, 1, 'black'),
        new Pawn(6, 1, 'black'),
        new Pawn(7, 1, 'black'),
      ],
      new Array(8).fill(null),
      new Array(8).fill(null),
      new Array(8).fill(null),
      new Array(8).fill(null),
      [
        new Pawn(0, 6, 'white'),
        new Pawn(1, 6, 'white'),
        new Pawn(2, 6, 'white'),
        new Pawn(3, 6, 'white'),
        new Pawn(4, 6, 'white'),
        new Pawn(5, 6, 'white'),
        new Pawn(6, 6, 'white'),
        new Pawn(7, 6, 'white'),
      ],
      [
        new Rook(0, 7, 'white'),
        new Knight(1, 7, 'white'),
        new Bishop(2, 7, 'white'),
        new Queen(3, 7, 'white'),
        new King(4, 7, 'white'),
        new Bishop(5, 7, 'white'),
        new Knight(6, 7, 'white'),
        new Rook(7, 7, 'white'),
      ],
    ]
  }

  /**
   * @param pieceToMoveCoords 
   * @param destinationCoords 
   * @returns true if the board has been updated false otherwise
   */
  updateBoard(pieceToMoveCoords, destinationCoords): boolean {
    if(this.status) return false
    let pieceToMove = utils.getPiece(pieceToMoveCoords, this.board)
    if(!pieceToMove) return false
    if(pieceToMove.color !== this.playerTurn) return false
    if(!pieceToMove.legalMoves.find(move => move.x === destinationCoords.x && move.y === destinationCoords.y)) return false
    this.board = utils.computeNextPosition(pieceToMoveCoords, destinationCoords, this.board)
    if(pieceToMove.type === 'Pawn') {
      if(Math.abs(pieceToMoveCoords.y - destinationCoords.y) === 2) this.board[destinationCoords.y][destinationCoords.x].enPassantPossible = true
      if(Math.abs(pieceToMoveCoords.x - destinationCoords.x) === 1) this.board[pieceToMoveCoords.y][destinationCoords.x] = null
    }
    if(pieceToMove.type === 'King') {
      if(pieceToMoveCoords.x - destinationCoords.x === - 2) { // short castle
        this.board[pieceToMoveCoords.y][5] = this.board[pieceToMoveCoords.y][7]
        this.board[pieceToMoveCoords.y][7] = null
        this.board[pieceToMoveCoords.y][5].updateCoords({x: 5, y: pieceToMoveCoords.y})
      }
      if(pieceToMoveCoords.x - destinationCoords.x === 2) { // long castle
        this.board[pieceToMoveCoords.y][3] = this.board[pieceToMoveCoords.y][0]
        this.board[pieceToMoveCoords.y][0] = null
        this.board[pieceToMoveCoords.y][3].updateCoords({x: 3, y: pieceToMoveCoords.y})
      }
    }
    
    
    this.board[destinationCoords.y][destinationCoords.x].updateCoords(destinationCoords)
    utils.toString(this.board)
    this.playerTurn = this.playerTurn === 'white' ? 'black' : 'white'
    utils.defineAllLegalMoves(this, this.board);
    
    // game status check
    if(utils.getPlayerMovesCount(this) === 0) {
      if(utils.isKingChecked(utils.getKingOfColor(this.playerTurn, this.board), this.board)) this.status = this.playerTurn === 'black' ? 'white' : 'black'
      else this.status = 'pat'
    }

    return true
  }
}
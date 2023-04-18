export class Piece {
  x; // lettres 0 = A, 7 = h
  y; // /!\ blanc pov 0 c'est en bas
  color;
  moved = false;
  legalMoves = [];
  constructor(x, y, color) {
    this.x = x
    this.y = y
    this.color = color
  }

  updateCoords(coords) {
    this.x = coords.x;
    this.y = coords.y;
    this.moved = true
  }
}
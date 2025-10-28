export type ChessCoordinates = string

export interface MoveInstruction {
  from: ChessCoordinates
  to: ChessCoordinates
}

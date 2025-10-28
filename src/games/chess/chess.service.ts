import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { MoveInstruction } from './declarations';
import State from 'src/State';
import ReadmeService from 'src/services/ReadmeService';
import { ChessDynamicModule } from 'src/modules';

@Injectable()
export class ChessService {
  
  async new(id: string, res?: Response) {
    const module = State.modules.find(
      m => m.data['uuid'] === id
    ) as ChessDynamicModule

    await module.new()

    await ReadmeService.updateReadmeAndRedirect(':chess_pawn: Reset chess', res, '#a-classic-chess')
  }

  async move(id: string, move: MoveInstruction, res: Response) {

    const module = State.modules.find(
      m => m.data['uuid'] === id
    ) as ChessDynamicModule

    if(await module.move(move))
      await ReadmeService.updateReadmeAndRedirect(':chess_pawn: Update chess', res, '#a-classic-chess')
    else ReadmeService.doNothingAndRedirect(res, '#a-classic-chess')
  }

  async board(id: string, res: Response) {
    const module = State.modules.find(
      m => m.data['uuid'] === id
    ) as ChessDynamicModule

    return res.send(await module.getBoardBuffer())
  }
}

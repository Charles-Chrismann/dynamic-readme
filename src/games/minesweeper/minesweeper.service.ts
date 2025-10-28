import { Injectable} from '@nestjs/common';
import { MinesweeperDynamicModule } from 'src/modules/dynamics/minesweeper.module';
import State from 'src/State';
import ReadmeService from 'src/services/ReadmeService';
import { Response } from 'express';

@Injectable()
export class MinesweeperService {

  async new(id: string, res: Response) {

    const module = State.modules.find(
      m => m.data['uuid'] === id
    ) as MinesweeperDynamicModule

    await module.new()
    await ReadmeService.updateReadmeAndRedirect(':boom: Reset minesweeper', res, '#a-classic-minesweeper')
  }

  async click(id: string, x: number, y:number, res: Response) {
    const module = State.modules.find(
      m => m.data['uuid'] === id
    ) as MinesweeperDynamicModule

    const shouldCommit = await module.click(x, y)
    if(shouldCommit) await ReadmeService.updateReadmeAndRedirect(':boom: Update minesweeper', res, '#a-classic-minesweeper')
    else ReadmeService.doNothingAndRedirect(res, '#a-classic-minesweeper')
  }

  async gif(id: string, res: Response) {
    const module = State.modules.find(
      m => m.data['uuid'] === id
    ) as MinesweeperDynamicModule

    return res.send(await module.gif())
  }
}

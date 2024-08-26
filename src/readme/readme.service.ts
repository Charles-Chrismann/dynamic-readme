import { Injectable, OnModuleInit } from '@nestjs/common';
import { Octokit } from 'octokit';
import { MinesweeperService } from 'src/games/minesweeper/minesweeper.service';
import { ChessService } from 'src/games/chess/chess.service';
import { RequestService } from 'src/request/request.service';
import { WordleService } from 'src/games/wordle/wordle.service';
import { GbaService } from 'src/games/gba/gba.service';
import renderer from './Renderer';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class ReadmeService {
  currentContentSha: string | null;
  startDateRender: number;

  constructor(
    private configService: ConfigService,
    private requestService: RequestService,
    private minesweeperService: MinesweeperService,
    private chessService: ChessService,
    private wordleService: WordleService,
    private gbaService: GbaService,
  ) {
    renderer.services.set("request", this.requestService)
    renderer.services.set("minesweeper", this.minesweeperService)
    renderer.services.set("chess", this.chessService)
    renderer.services.set("wordle", this.wordleService)
    renderer.services.set("gba", this.gbaService)
    this.currentContentSha = null;
  }

  async push(octokit: Octokit, message: string, content: string, sha: string): Promise<string> {
    const {config} = this.configService
    return (await octokit.request(
      `PUT /repos/${config.datas.repo.owner}/${config.datas.repo.name}/contents/${config.datas.repo.readme.path}`,
      {
        owner: config.datas.repo.owner,
        repo: config.datas.repo.name,
        path: config.datas.repo.readme.path,
        message,
        committer: {
          name: process.env.OCTO_COMMITTER_NAME,
          email: process.env.OCTO_COMMITTER_EMAIL,
        },
        content,
        sha,
      },
    )).data.content.sha
  }

  async commit(commitMessage: string) {
    const {config} = this.configService
    this.startDateRender = Date.now();
    const octokit = new Octokit({ auth: process.env.GH_TOKEN });

    let sha: string | any = this.currentContentSha
    if(!this.currentContentSha) {
      sha = (await octokit.request(
        `GET /repos/${config.datas.repo.owner}/${config.datas.repo.name}/contents/${config.datas.repo.readme.path}`,
      )).data.sha;
    }

    const readmeContent = await renderer.render()

    const buffer = Buffer.from(readmeContent);
    const base64 = buffer.toString('base64');
    if(process.env.NO_COMMIT === "true") return
    let pushRespSha: string
    try {
      pushRespSha = await this.push(octokit, commitMessage, base64, sha)
    } catch (e) {
      this.currentContentSha = (await octokit.request(`GET /repos/${config.datas.repo.owner}/${config.datas.repo.name}/contents/${config.datas.repo.readme.path}`)).data.sha
      pushRespSha = await this.push(octokit, commitMessage, base64, this.currentContentSha)
    }
    this.currentContentSha = pushRespSha;
  }
}

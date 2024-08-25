import { Injectable, OnModuleInit } from '@nestjs/common';
import { Octokit } from 'octokit';
import * as config from '../../config.json';
import { MinesweeperService } from 'src/games/minesweeper/minesweeper.service';
import { ChessService } from 'src/games/chess/chess.service';
import { RequestService } from 'src/request/request.service';
import { WordleService } from 'src/games/wordle/wordle.service';
import { GbaService } from 'src/games/gba/gba.service';
import renderer from './Renderer';

@Injectable()
export class ReadmeService {
  currentContentSha: string | null;
  startDateRender: number;

  constructor(
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

  renderFollowersTable(): string {
    let followers = this.requestService.lastFollowers;
    let returnString = '';
    returnString += `<table align="center">\n  <thead>\n    <tr>\n      <th colspan="3" width="512">Last Followers</th>\n    </tr>\n  </thead>\n  <tbody>\n`;
    returnString += JSON.parse(JSON.stringify(followers.lastFollowers)).reverse().map((follower, index) => {
      return `    <tr>\n      <td align="center">${followers.followerCount - (followers.lastFollowers.length - index - 1)}</td>\n      <td align="center">\n        <a href="https://github.com/${follower.login}" target="_blank">\n          <img src="${follower.avatarUrl}" alt="${follower.login}" width="40" height="40"/>\n        </a>\n      </td>\n      <td>\n        <a href="https://github.com/${follower.login}" target="_blank">${follower.login}</a>\n      </td>\n    </tr>\n`;
    }).join('');
    returnString += `    <tr>\n      <td align="center">${followers.followerCount + 1}</td>\n      <td align="center" colspan="2">Maybe You ? (can take a few minutes to update)</td>\n    </tr>`;
    returnString += `\n  </tbody>\n</table>\n`;
    return returnString
  }

  async push(octokit: Octokit, message: string, content: string, sha: string): Promise<string> {
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

import { Injectable } from '@nestjs/common';
import { Octokit } from 'octokit';

import * as config from '../../config.json';
import { MinesweeperService } from 'src/games/minesweeper/minesweeper.service';
import { ChessService } from 'src/games/chess/chess.service';
import { RequestService } from 'src/request/request.service';

@Injectable()
export class ReadmeService {
  currentContentSha: string | null;
  startDateRender: number;

  constructor(
    private requestService: RequestService,
    private minesweeperService: MinesweeperService,
    private chessService: ChessService,
  ) {
    this.currentContentSha = null;
  }

  renderFollowersTable(): string {
    let followers = this.requestService.lastFollowers;
    let returnString = '';
    returnString += `<table align="center"><thead><tr><th colspan="3" width="512">Last Followers</th></tr></thead><tbody>`;
    JSON.parse(JSON.stringify(followers.lastFollowers)).reverse().forEach((follower, index) => {
      returnString += `<tr><td align="center">${followers.followerCount - (followers.lastFollowers.length - index - 1)}</td><td align="center"><a href="https://github.com/${follower.login}" target="_blank"><img src="${follower.avatarUrl}" alt="${follower.login}" width="40" height="40"/></a></td><td><a href="https://github.com/${follower.login}" target="_blank">${follower.login}</a></td></tr>`;
    });
    returnString += `<tr><td align="center">${followers.followerCount + 1}</td><td align="center" colspan="2">Maybe You ? (can take a few minutes to update)</td></tr>`;
    returnString += `</tbody></table>`;
    return returnString
  }

  private async render(): Promise<string> {
    let readMeString = '';
    let skills = config.skills;

    readMeString += `<h1>:wave: - Hi visitor</h1>`;
    readMeString += `<h3>I'm ${config.datas.perso.firstname} ${config.datas.perso.lastname} !</h3>`;
    readMeString += config.datas.perso.description.map((line: string | string[]) => 
      typeof line === "string" ? `<p>${line}</p>` : `<ul>${line.map((item: string) => `<li>${item}</li>`).join('')}</ul>`
    ).join('');

    readMeString += this.renderFollowersTable()

    if (config.datas.perso.socials.length > 0) {
      readMeString += `<h1 align="left">Reach Me</h1>`;
      readMeString += `<p align="left">`;
      config.datas.perso.socials.forEach((social) => {
        readMeString += `<a href="${social.profile_url}" target="blank"><img align="center" src="${social.icon_url}" alt="${social.name}" height="30" width="40" /></a>`;
      });
      readMeString += `</p>`;
    }
    readMeString += `<h1 align="center">Technical skills</h1>`;

    if(config.skills.learning) {
      readMeString += `<h3 align="left">Currently learning: `;
      skills.learning.forEach((skill) => {
        readMeString += `<a href="${skill.url}" target="_blank" rel="noreferrer"><img src="${skill.src}" alt="${skill.alt}" width="40" height="40"/></a> `;
      });
      readMeString += `</h3>`;
    }

    // Front
    readMeString += `<h3>Front-end technologies</h3><p align="left">`;
    skills.front.forEach((skill) => {
      readMeString += `<a href="${skill.url}" target="_blank" rel="noreferrer"><img src="${skill.src}" alt="${skill.alt}" width="40" height="40"/></a> `;
    });
    readMeString += `</p>`;

    // Back
    readMeString += `<h3>Back-end technologies</h3><p align="left">`;
    skills.back.forEach((skill) => {
      readMeString += `<a href="${skill.url}" target="_blank" rel="noreferrer"><img src="${skill.src}" alt="${skill.alt}" width="40" height="40"/></a> `;
    });
    readMeString += `</p>`;

    // Notions
    readMeString += `<h3>Other technologies where I have notions</h3><p align="left">`;
    skills.notions.forEach((skill) => {
      readMeString += `<a href="${skill.url}" target="_blank" rel="noreferrer"><img src="${skill.src}" alt="${skill.alt}" width="40" height="40"/></a> `;
    });
    readMeString += `</p>`;

    // Tools
    readMeString += `<h3>Tools</h3><p align="left">`;
    skills.tools.forEach((skill) => {
      readMeString += `<a href="${skill.url}" target="_blank" rel="noreferrer"><img src="${skill.src}" alt="${skill.alt}" width="40" height="40"/></a> `;
    });
    readMeString += `</p>`;
    readMeString += `<h1 align="center">Flex Zone</h1>`;
    readMeString += this.minesweeperService.toMd();
    readMeString += this.chessService.toMd();

    readMeString += `<h1 align="center">Work in progress</h1>`;
    readMeString += `<p align="center">Other features are in progress, feel free to follow me to discover them.</p>`;
    readMeString += `<p align="center"><img align="center" src="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/trigger" alt="work in progress" width="256" /></p>`;
    readMeString += `<p align="center"><a href="https://github.com/${config.datas.repo.owner}">See ya <3</a></p>`;
    let currentDate = new Date();
    const days = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep" , "Oct", "Nov", "Dec"]
    readMeString += `<p align="right">Generated in: ${(Date.now() - this.startDateRender) / 1000}s on ${days[currentDate.getDay()]} ${months[currentDate.getMonth()]} ${currentDate.getDate()} at ${currentDate.getHours()}:${currentDate.getMinutes().toString().padStart(2, '0')}</p>`;

    return readMeString;
  }

  async commit() {
    this.startDateRender = Date.now();
    const octokit = new Octokit({ auth: process.env.GH_TOKEN });

    let sha: string | any = this.currentContentSha
    if(!this.currentContentSha) {
      sha = (await octokit.request(
        `GET /repos/${config.datas.repo.owner}/${config.datas.repo.name}/contents/${config.datas.repo.readme.path}`,
      )).data.sha;
    }

    const buffer = Buffer.from(await this.render());
    const base64 = buffer.toString('base64');
    // return
    let pushResp = await octokit.request(
      `PUT /repos/${config.datas.repo.owner}/${config.datas.repo.name}/contents/${config.datas.repo.readme.path}`,
      {
        owner: config.datas.repo.owner,
        repo: config.datas.repo.name,
        path: config.datas.repo.readme.path,
        message: config.datas.repo.commit.message,
        committer: {
          name: process.env.OCTO_COMMITTER_NAME,
          email: process.env.OCTO_COMMITTER_EMAIL,
        },
        content: base64,
        sha: sha,
      },
    );
    this.currentContentSha = pushResp.data.content.sha;
  }
}

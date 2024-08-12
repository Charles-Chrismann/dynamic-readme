import { Injectable, OnModuleInit } from '@nestjs/common';
import { Octokit } from 'octokit';
import * as config from '../../config.json';
import { MinesweeperService } from 'src/games/minesweeper/minesweeper.service';
import { ChessService } from 'src/games/chess/chess.service';
import { RequestService } from 'src/request/request.service';
import { WordleService } from 'src/games/wordle/wordle.service';
import { GbaService } from 'src/games/gba/gba.service';

@Injectable()
export class ReadmeService {
  currentContentSha: string | null;
  startDateRender: number;

  constructor(
    private requestService: RequestService,
    private minesweeperService: MinesweeperService,
    private chessService: ChessService,
    private wordleService: WordleService,
    private gbaService: GbaService
  ) {
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

  private async render(): Promise<string> {
    let readMeString = '';
    let skills = config.skills;

    readMeString += `<h1>:wave: - Hi visitor</h1>\n`;
    readMeString += `<h3>I'm ${config.datas.perso.firstname} ${config.datas.perso.lastname} !</h3>\n`;

    if(config.datas.perso.vueCount) readMeString += `<p align="center">\n  <img src="${config.datas.perso.vueCount}">\n</p>\n`

    readMeString += config.datas.perso.description.filter((_, i) => i <= 1).map((line: string | string[]) => 
      typeof line === "string" ? `<p>${line}</p>\n` : `<ul>\n${line.map((item: string) => `  <li>${item}</li>\n`).join('')}</ul>\n`
    ).join('');

    readMeString += await this.gbaService.toMd();

    readMeString += config.datas.perso.description.filter((_, i) => i > 1).map((line: string | string[]) => 
      typeof line === "string" ? `<p>${line}</p>\n` : `<ul>\n${line.map((item: string) => `  <li>${item}</li>\n`).join('')}</ul>\n`
    ).join('');

    readMeString += this.renderFollowersTable()

    if (config.datas.perso.socials.length > 0) {
      readMeString += `<h1 align="left">Reach Me</h1>\n`;
      readMeString += `<p align="left">\n`;
      readMeString += config.datas.perso.socials.map((social) => {
        return `  <a href="${social.profile_url}" target="blank">\n    <img align="center" src="${social.icon_url}" alt="${social.name}" height="30" width="40" />\n  </a>\n`;
      }).join('');
      readMeString += `</p>\n`;
    }
    readMeString += `<h1 align="center">Technical skills</h1>\n`;

    if(config.skills.learning) {
      readMeString += `<h3 align="left">Currently learning:\n`;
      readMeString += skills.learning.map((skill) => {
        return `  <a href="${skill.url}" target="_blank" rel="noreferrer">\n    <img src="${skill.src}" alt="${skill.alt}" width="40" height="40"/>\n  </a>\n`;
      }).join('');
      readMeString += `</h3>\n`;
    }

    // Front
    readMeString += `<h3>Front-end technologies</h3>\n<p align="left">\n`;
    readMeString += skills.front.map((skill) => {
      return `  <a href="${skill.url}" target="_blank" rel="noreferrer">\n    <img src="${skill.src}" alt="${skill.alt}" width="40" height="40"/>\n  </a>\n`;
    }).join('');
    readMeString += `</p>\n`;

    // Back
    readMeString += `<h3>Back-end technologies</h3>\n<p align="left">\n`;
    readMeString += skills.back.map((skill) => {
      return `  <a href="${skill.url}" target="_blank" rel="noreferrer">\n    <img src="${skill.src}" alt="${skill.alt}" width="40" height="40"/>\n  </a>\n`;
    }).join('');
    readMeString += `</p>\n`;

    // Notions
    readMeString += `<h3>Other technologies where I have notions</h3>\n<p align="left">\n`;
    readMeString += skills.notions.map((skill) => {
      return `  <a href="${skill.url}" target="_blank" rel="noreferrer">\n    <img src="${skill.src}" alt="${skill.alt}" width="40" height="40"/>\n  </a>\n`;
    }).join('');
    readMeString += `</p>\n`;

    // Tools
    readMeString += `<h3>Tools</h3>\n<p align="left">\n`;
    readMeString += skills.tools.map((skill) => {
      return `  <a href="${skill.url}" target="_blank" rel="noreferrer">\n    <img src="${skill.src}" alt="${skill.alt}" width="40" height="40"/>\n  </a>\n`;
    }).join('');
    readMeString += `</p>\n`;
    readMeString += `<h1 align="center">Flex Zone</h1>\n`;
    readMeString += await this.minesweeperService.toMd();
    readMeString += await this.chessService.toMd();
    readMeString += await this.wordleService.toMd();

    readMeString += `<h1 align="center">Work in progress</h1>\n`;
    readMeString += `<p align="center">Other features are in progress, feel free to follow me to discover them.</p>\n`;
    readMeString += `<p align="center">To understand how it works, take a look <a href="https://github.com/Charles-Chrismann/dynamic-readme" target="_blank" rel="noreferrer" title="github dynalic readme">here</a></p>\n`;
    readMeString += `<p align="center">\n  <img align="center" src="${process.env.EC2_PROTOCOL}://${process.env.EC2_SUB_DOMAIN}.${process.env.EC2_DOMAIN}/trigger" alt="work in progress" width="256" />\n</p>\n`;
    readMeString += `<p align="center">\n  <a href="https://github.com/${config.datas.repo.owner}">See ya <3</a>\n</p>\n`;
    let currentDate = new Date();
    const days = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep" , "Oct", "Nov", "Dec"]
    readMeString += `<p align="right">Generated in ${(Date.now() - this.startDateRender) / 1000}s on ${days[currentDate.getDay()]} ${months[currentDate.getMonth()]} ${currentDate.getDate()} at ${currentDate.getHours()}:${currentDate.getMinutes().toString().padStart(2, '0')}</p>\n`;
    
    return readMeString;
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

    const buffer = Buffer.from(await this.render());
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

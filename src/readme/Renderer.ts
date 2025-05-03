import { RequestService } from "src/request/request.service"
import { ChessService } from "src/games/chess/chess.service"
import { GameboyService } from "src/games/gameboy/gameboy.service"
import { GbaService } from "src/games/gba/gba.service"
import { MinesweeperService } from "src/games/minesweeper/minesweeper.service"
import { WordleService } from "src/games/wordle/wordle.service"
import * as fs from 'fs'
import Config from "src/declarations/config.interface"

class Module {
  value: string

  constructor(
    private parent: Renderer,
    public flat: any
  ) {}

  render() {
    const {config} = this.parent
    if(this.value) return this.value

    const {id, data, options} = this.flat
    console.log(id)
    if(id === "static/element") this.value = `<${data.element}${options?.align ? ` align="${options?.align}"` : `` }>${data.content}</${data.element}>\n`
    else if(id === "static/raw") this.value = data.content + ((data.content as string).endsWith('\n') ? "" : "\n")
    else if(id === "static/greeting") this.value = `<h3>I'm ${config.datas.perso.firstname} ${config.datas.perso.lastname} !</h3>\n`
    else if(id === "3rdParty/profileViews") this.value = `<p align="center">\n  <img src="${config.datas.perso.vueCount}">\n</p>\n`
    else if(id === "static/lines") {
      const path = data.field.split('.')
      let lines: any = config.datas;

      for (let i = 0; i < path.length; i++) {
        lines = lines[path[i]];
      }

      if(!data.range.includes('-')) lines = [lines[+data.range - 1]]
      else {
        const [start, end] = data.range.split('-').map((r: string) => +r)
        lines = lines.slice(start - 1, end)
      }

      this.value = lines.map(l => `<p>${l}</p>\n`).join('')
    }
    else if(id === "static/list") {
      const path = data.field.split('.')
      let list: any = config.datas;

      for (let i = 0; i < path.length; i++) {
        list = list[path[i]];
      }

      const {title, content} = list

      this.value = `${title ? `<p>${title}</p>\n` : ''}<ul>\n${content.map(l => `  <li>${l}</li>\n`).join('')}</ul>\n`
    }
    else if(id === "static/socials") {
      let readMeString = ''
      readMeString += `<h1 align="left">Reach Me</h1>\n`;
      readMeString += `<p align="${options.align ?? "left"}">\n`;
      readMeString += config.datas.perso.socials.map((social) => {
        return `  <a href="${social.profile_url}" target="blank">\n    <img align="center" src="${social.icon_url}" alt="${social.name}" height="40" width="40" />\n  </a>\n`;
      }).join('');
      readMeString += `</p>\n`;

      this.value = readMeString
    }
    else if(id === "static/skills") {
      let skills = config.skills;
      let readMeString = ''

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

      this.value = readMeString
    }
    else if(id === "static/trigger") {
      let readMeString = ''
      readMeString += `<h1 align="center">Work in progress</h1>\n`;
      readMeString += `<p align="center">Other features are in progress, feel free to follow me to discover them.</p>\n`;
      readMeString += `<p align="center">To understand how it works, take a look <a href="https://github.com/Charles-Chrismann/dynamic-readme" target="_blank" rel="noreferrer" title="github dynalic readme">here</a></p>\n`;
      readMeString += `<p align="center">\n  <img align="center" src="${this.parent.BASE_URL}/trigger" alt="work in progress" width="256" />\n</p>\n`;
      readMeString += `<p align="center">\n  <a href="https://github.com/${config.datas.repo.owner}">See ya <3</a>\n</p>\n`;
      this.value = readMeString
    }

    return this.value
  }
}

class AsyncModule {

  constructor(private parent: Renderer, public flat: any) {}

  async render() {

    const {id, data, options} = this.flat

    if(id === "dynamic/followers") {

      const followers = (this.parent.services.get('request')! as RequestService).lastFollowers

      let returnString = '';
      returnString += `<table align="center">\n  <thead>\n    <tr>\n      <th colspan="3" width="512">Last Followers</th>\n    </tr>\n  </thead>\n  <tbody>\n`;
      returnString += JSON.parse(JSON.stringify(followers.lastFollowers)).reverse().map((follower, index) => {
        return `    <tr>\n      <td align="center">${followers.followerCount - (followers.lastFollowers.length - index - 1)}</td>\n      <td align="center">\n        <a href="https://github.com/${follower.login}" target="_blank">\n          <img src="${follower.avatarUrl}" alt="${follower.login}" width="40" height="40"/>\n        </a>\n      </td>\n      <td>\n        <a href="https://github.com/${follower.login}" target="_blank">${follower.login}</a>\n      </td>\n    </tr>\n`;
      }).join('');
      returnString += `    <tr>\n      <td align="center">${followers.followerCount + 1}</td>\n      <td align="center" colspan="2">Maybe You ? (can take a few minutes to update)</td>\n    </tr>`;
      returnString += `\n  </tbody>\n</table>\n`;

      return returnString
    }
    else if(id.startsWith('games/')) {
      return await (this.parent.services.get(id.split('/')[1])! as ChessService | GameboyService | GbaService | MinesweeperService | WordleService).toMd(this.parent.BASE_URL, data, options)
    }
    else if(id === "dynamic/generated") {
      let currentDate = new Date();
      const days = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      const months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep" , "Oct", "Nov", "Dec"]
      return `<p align="right">Generated in ${(Date.now() - this.parent.startRenderDate) / 1000}s on ${days[currentDate.getDay()]} ${months[currentDate.getMonth()]} ${currentDate.getDate()} at ${currentDate.getHours()}:${currentDate.getMinutes().toString().padStart(2, '0')}</p>\n`;
    }
  }
}

class Renderer {
  BASE_URL = `${process.env.APP_PROTOCOL}://${process.env.APP_SUB_DOMAIN}.${process.env.APP_DOMAIN}`
  services = new Map<string, RequestService | ChessService | GameboyService | GbaService | MinesweeperService | WordleService>()
  structure: (Module | AsyncModule)[]
  startRenderDate: number
  config: Config
  constructor() {
    this.config = JSON.parse(fs.readFileSync('./config.json').toString())
    this.createStructure()
  }

  createStructure() {
    const {config} = this
    this.structure = config.structure.filter(m => !m?.disabled).map(flatModule => {
      if(
        flatModule.id === "trigger"
        || flatModule.id.startsWith("static")
        || flatModule.id.startsWith("3rdParty")
      ) return new Module(this, flatModule)
      return new AsyncModule(this, flatModule)
    })
  }

  async render() {

    this.startRenderDate = Date.now()

    const parts = await Promise.all(this.structure.filter(m => m.flat.id !== "dynamic/generated").map(m => m.render()))
    if(this.structure.at(-1).flat.id === "dynamic/generated") {
      let currentDate = new Date();
      const days = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      const months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep" , "Oct", "Nov", "Dec"]
      parts.push(`<p align="right">Generated in ${(Date.now() - this.startRenderDate) / 1000}s on ${days[currentDate.getDay()]} ${months[currentDate.getMonth()]} ${currentDate.getDate()} at ${currentDate.getHours()}:${currentDate.getMinutes().toString().padStart(2, '0')}</p>\n`);
    }

    return parts.join('')
  }
}

export default new Renderer()
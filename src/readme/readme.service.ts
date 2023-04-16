import { Injectable } from '@nestjs/common';
import { Octokit } from 'octokit';

import * as config from '../../config.json';
import { MinesweeperService } from 'src/games/minesweeper/minesweeper.service';

@Injectable()
export class ReadmeService {
  constructor(private minesweeperService: MinesweeperService) {}

  render(): string {
    let readMeString = ""
    let skills = config.skills

    readMeString += `<h1>:wave: - Hi visitor</h1>`
    readMeString += `<h3>I'm ${config.datas.perso.firstname} ${config.datas.perso.lastname} !</h3>`
    readMeString += config.datas.perso.description
    if(config.datas.perso.socials.length > 0) {
      readMeString += `<h1 align="left">Reach Me</h1>`
      readMeString += `<p align="left">`
      config.datas.perso.socials.forEach(social => {
        readMeString += `<a href="${social.profile_url}" target="blank"><img align="center" src="${social.icon_url}" alt="${social.name}" height="30" width="40" /></a>`
      })
      readMeString += `</p>`
    }
    readMeString += `<h1 align="center">Technical skills</h1>`

    // Front
    readMeString += `<h3>Front-end technologies</h3><p align="left">`
    skills.front.forEach(skill => {
      readMeString += `<a href="${skill.url}" target="_blank" rel="noreferrer"><img src="${skill.src}" alt="${skill.alt}" width="40" height="40"/></a> `
    })
    readMeString += `</p>`

    // Back
    readMeString += `<h3>Back-end technologies</h3><p align="left">`
    skills.back.forEach(skill => {
      readMeString += `<a href="${skill.url}" target="_blank" rel="noreferrer"><img src="${skill.src}" alt="${skill.alt}" width="40" height="40"/></a> `
    })
    readMeString += `</p>`

    // Notions
    readMeString += `<h3>Other technologies where I have notions</h3><p align="left">`
    skills.notions.forEach(skill => {
      readMeString += `<a href="${skill.url}" target="_blank" rel="noreferrer"><img src="${skill.src}" alt="${skill.alt}" width="40" height="40"/></a> `
    })
    readMeString += `</p>`

    // Tools
    readMeString += `<h3>Tools</h3><p align="left">`
    skills.tools.forEach(skill => {
      readMeString += `<a href="${skill.url}" target="_blank" rel="noreferrer"><img src="${skill.src}" alt="${skill.alt}" width="40" height="40"/></a> `
    })
    readMeString += `</p>`
    readMeString += `<h1 align="center">Flex Zone</h1>`
    readMeString += this.minesweeperService.toMd()

    return readMeString
  }

    async commit() {
        const octokit = new Octokit({ auth: process.env.GH_TOKEN })

        let data = await octokit.request(`GET /repos/${config.datas.repo.owner}/${config.datas.repo.name}/contents/${config.datas.repo.readme.path}`)

        await octokit.request(
          `PUT /repos/${config.datas.repo.owner}/${config.datas.repo.name}/contents/${config.datas.repo.readme.path}`,
          {
            owner: config.datas.repo.owner,
            repo: config.datas.repo.name,
            path: config.datas.repo.readme.path,
            message: config.datas.repo.commit.message,
            committer: {
              name: process.env.OCTO_COMMITTER_NAME,
              email: process.env.OCTO_COMMITTER_EMAIL
            },
            content: btoa(this.render()),
            sha: data.data.sha
          })
    }
}

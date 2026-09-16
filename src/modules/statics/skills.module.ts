import { AppConfigService } from "src/services";
import { AbstractStaticModule } from "../abstract.module";
import { AppConfig } from "src/declaration";
import State from "src/State";

interface Data {
}

interface Options {
  align: "start" | "center" | "end"
}

export class SkillsStaticModule extends AbstractStaticModule<Data, Options> {
  public render(): string | Promise<string> {
    const skills = State.getConfig('datas.skills');
    let md = '<h1 align="center">Technical skills</h1>\n'

    for(const { title, list } of Object.values(skills)) {
      md += `<h3 align="left">${title}:\n<p align="left">\n`;
      md += list.map(({ name, url, src }) =>
        `  <a href="${url}" target="_blank" rel="noreferrer"><img src="${src}" alt="${name}'s logo" height="40"/></a>\n`
      ).join('')
      md += `\n</p>`;
    }

    return md
  }
}
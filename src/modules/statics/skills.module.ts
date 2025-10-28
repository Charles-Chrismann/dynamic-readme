import { AppConfigService } from "src/services";
import { AbstractStaticModule } from "../abstract.module";
import { AppConfig } from "src/declaration";

interface Data {
}

interface Options {
  align: "start" | "center" | "end"
}

export class SkillsStaticModule extends AbstractStaticModule<Data, Options> {
  public render(): string | Promise<string> {
    const skills = AppConfigService.getOrThrow<AppConfig['datas']['skills']>('config.datas.skills');
    let md = ''

    md += `<h1 align="center">Technical skills</h1>\n`;
    if(skills.learning) {
      md += `<h3 align="left">Currently learning:\n`;
      md += skills.learning.list.map((skill) => {
        return `  <a href="${skill.url}" target="_blank" rel="noreferrer">\n    <img src="${skill.src}" alt="${skill.alt}" width="40" height="40"/>\n  </a>\n`;
      }).join('');
      md += `</h3>\n`;
    }

    // Front
    md += `<h3>Front-end technologies</h3>\n<p align="left">\n`;
    md += skills.front.list.map((skill) => {
      return `  <a href="${skill.url}" target="_blank" rel="noreferrer">\n    <img src="${skill.src}" alt="${skill.alt}" width="40" height="40"/>\n  </a>\n`;
    }).join('');
    md += `</p>\n`;

    // Back
    md += `<h3>Back-end technologies</h3>\n<p align="left">\n`;
    md += skills.back.list.map((skill) => {
      return `  <a href="${skill.url}" target="_blank" rel="noreferrer">\n    <img src="${skill.src}" alt="${skill.alt}" width="40" height="40"/>\n  </a>\n`;
    }).join('');
    md += `</p>\n`;

    // Notions
    md += `<h3>Other technologies where I have notions</h3>\n<p align="left">\n`;
    md += skills.notions.list.map((skill) => {
      return `  <a href="${skill.url}" target="_blank" rel="noreferrer">\n    <img src="${skill.src}" alt="${skill.alt}" width="40" height="40"/>\n  </a>\n`;
    }).join('');
    md += `</p>\n`;

    // Tools
    md += `<h3>Tools</h3>\n<p align="left">\n`;
    md += skills.tools.list.map((skill) => {
      return `  <a href="${skill.url}" target="_blank" rel="noreferrer">\n    <img src="${skill.src}" alt="${skill.alt}" width="40" height="40"/>\n  </a>\n`;
    }).join('');
    md += `</p>\n`;

    return md
  }
}
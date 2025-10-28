import { AppConfigService } from "src/services";
import { AbstractStaticModule } from "../abstract.module";
import { AppConfig } from "src/declaration";

interface Data {
}

interface Options {
}

export class TriggerStaticModule extends AbstractStaticModule<Data, Options> {
  public render(): string | Promise<string> {
    const owner = AppConfigService.getOrThrow<AppConfig['datas']['repo']['owner']>('config.datas.repo.owner');
    const env = AppConfigService.getOrThrow<string>('NODE_ENV');
    const BASE_URL = env === 'production'
    ? AppConfigService.APP_BASE_URL
    : "http://localhost:3000"
    let md = ''
    md += `<h1 align="center">Work in progress</h1>\n`;
    md += `<p align="center">Other features are in progress, feel free to follow me to discover them.</p>\n`;
    md += `<p align="center">To understand how it works, take a look <a href="https://github.com/Charles-Chrismann/dynamic-readme" target="_blank" rel="noreferrer" title="github dynalic readme">here</a></p>\n`;
    md += `<p align="center">\n  <img align="center" src="${BASE_URL}/trigger" alt="work in progress" width="256" />\n</p>\n`;
    md += `<p align="center">\n  <a href="https://github.com/${owner}">See ya <3</a>\n</p>\n`;
    return md
  }
}
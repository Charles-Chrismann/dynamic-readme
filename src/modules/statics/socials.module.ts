import { AppConfigService } from "src/services";
import { AbstractStaticModule } from "../abstract.module";
import { AppConfig } from "src/declaration";
import State from "src/State";

interface Data {
}

interface Options {
  align: "start" | "center" | "end"
}

export class SocialsStaticModule extends AbstractStaticModule<Data, Options> {
  public render(): string | Promise<string> {
    const socials = State.getConfig('datas.user.socials');
    
    const socialsStr = socials.map((social) => {
      return `  <a href="${social.profile_url}" target="blank">\n    <img align="center" src="${social.icon_url}" alt="${social.name}" height="40" width="40" />\n  </a>\n`;
    }).join('');

    return `<h1 align="left">Reach Me</h1>\n<p align="${this.options.align ?? "left"}">\n${socialsStr}</p>\n`;
  }
}
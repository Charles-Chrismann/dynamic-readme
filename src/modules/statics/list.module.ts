import { AppConfigService } from "src/services";
import { AbstractStaticModule } from "../abstract.module";
import State from "src/State";

interface Data {
  field: string
}

interface Options {
}

export class ListStaticModule extends AbstractStaticModule<Data, Options> {
  public render(): string | Promise<string> {
    
    const path = this.data.field.split('.')
    let list: any = State.getConfig('datas');

    for (let i = 0; i < path.length; i++) {
      list = list[path[i]];
    }

    const {title, content} = list

    return `${title ? `<p>${title}</p>\n` : ''}<ul>\n${content.map((l: string) => `  <li>${l}</li>\n`).join('')}</ul>\n`
  }
}
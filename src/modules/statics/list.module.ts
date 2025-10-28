import { AppConfigService } from "src/services";
import { AbstractStaticModule } from "../abstract.module";

interface Data {
  field: string
}

interface Options {
}

export class ListStaticModule extends AbstractStaticModule<Data, Options> {
  public render(): string | Promise<string> {
    
    const path = this.data.field.split('.')
    let list: any = AppConfigService.getOrThrow('config.datas');

    for (let i = 0; i < path.length; i++) {
      list = list[path[i]];
    }

    const {title, content} = list

    return `${title ? `<p>${title}</p>\n` : ''}<ul>\n${content.map(l => `  <li>${l}</li>\n`).join('')}</ul>\n`
  }
}
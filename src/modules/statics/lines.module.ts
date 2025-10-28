import { AppConfigService } from "src/services";
import { AbstractStaticModule } from "../abstract.module";

interface Data {
  field: string
  range: string
}

interface Options {
}

export class LinesStaticModule extends AbstractStaticModule<Data, Options> {
  public render(): string | Promise<string> {

    const path = this.data.field.split('.')
    let lines: any = AppConfigService.getOrThrow('config.datas');

    for (let i = 0; i < path.length; i++) {
      lines = lines[path[i]];
    }

    if(!this.data.range.includes('-')) lines = [lines[+this.data.range - 1]]
    else {
      const [start, end] = this.data.range.split('-').map((r: string) => +r)
      lines = lines.slice(start - 1, end)
    }

    const md = lines.map(l => `<p>${l}</p>\n`).join('')
    
    return md
  }
}
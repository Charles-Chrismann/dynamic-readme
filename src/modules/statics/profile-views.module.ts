import { AbstractStaticModule } from "../abstract.module";

interface Data {
  login: string
}

interface Options {
  align: "start" | "center" | "end"
}

export class ProfileViewsStaticModule extends AbstractStaticModule<Data, Options> {
  public render(): string | Promise<string> {
    return `<p align="${this.options.align ?? "center"}">\n  <img src="https://komarev.com/ghpvc/?username=${this.data.login}" alt="${this.data.login}'s profile view count">\n</p>\n`
  }
}
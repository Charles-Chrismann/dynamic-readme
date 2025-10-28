import { AbstractStaticModule } from "../abstract.module";

interface Data {
  content: string
}

interface Options {
}

export class RawStaticModule extends AbstractStaticModule<Data, Options> {
  public render(): string | Promise<string> {
    return this.data.content
  }
}
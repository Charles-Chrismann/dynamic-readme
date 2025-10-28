import { AbstractStaticModule } from "../abstract.module";

interface Data {
  firstName: string
  lastName: string
}

interface Options {
}

export class GreetingStaticModule extends AbstractStaticModule<Data, Options> {
  public render(): string | Promise<string> {
    return `<h3>I'm ${this.data.firstName} ${this.data.lastName} !</h3>\n`
  }
}
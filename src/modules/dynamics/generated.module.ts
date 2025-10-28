import { AbstractDynamicModule } from "../abstract.module";
import State from "src/State";

interface Data {
}

interface Options {
}

export class GeneratedDynamicModule extends AbstractDynamicModule<Data, Options> {
  ALWAYS_RERENDER = true

  public render(): string | Promise<string> {
    let currentDate = new Date();
    const days = [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep" , "Oct", "Nov", "Dec"]
    return `<p align="right">Generated in ${(Date.now() - State.startRenderDTimestamp) / 1000}s on ${days[currentDate.getDay()]} ${months[currentDate.getMonth()]} ${currentDate.getDate()} at ${currentDate.getHours()}:${currentDate.getMinutes().toString().padStart(2, '0')}</p>\n`;
  }
}
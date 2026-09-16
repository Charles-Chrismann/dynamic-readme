import { AppConfigService } from "src/services";
import { AbstractStaticModule } from "../abstract.module";

export class SeparatorModule extends AbstractStaticModule {
  public render() {
    return "<hr>"
  }
}
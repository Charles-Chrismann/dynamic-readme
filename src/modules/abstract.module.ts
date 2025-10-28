import { Logger } from "@nestjs/common"
import { randomUUID } from "crypto"
import { AppConfigService } from "src/services"

export abstract class AbstractModule<Data = Record<string, any>, Options = Record<string, any>> {
  public data: Data
  protected options: Options
  protected md: string
  constructor(data: Data, options: Options = {} as Options) {
    this.data = data
    this.options = options
  }
  public abstract render(): string | Promise<string>
  public abstract toMd(): Promise<string>
}

export abstract class AbstractStaticModule<Data = Record<string, any>, Options = Record<string, any>> extends AbstractModule<Data, Options>{
  public async toMd(): Promise<string> {
    if(this.md) return this.md
    const md = await this.render()
    this.md = md
    return md
  }
}

export abstract class AbstractDynamicModule<Data = Record<string, any>, Options = Record<string, any>> extends AbstractModule<Data, Options>{
  ALWAYS_RERENDER = false

  needsRender: boolean = true
  id: string
  protected readonly logger: Logger

  constructor(data: Data, options?: Options) {
    super(data, options)
    this.id = randomUUID()
    this.logger = new Logger(`${this.constructor.name}`)
  }

  public init(): Promise<void> {
    return
  }
  
  public async toMd() {
    if(this.ALWAYS_RERENDER) {
      if(AppConfigService.getOrThrow('NODE_ENV') === "development")
        this.logger.verbose(`Rendering (always) module ${this.id}`)
      
      return await this.render()
    }
    if(!this.needsRender && this.md) return this.md
    if(AppConfigService.getOrThrow('NODE_ENV') === "development")
      this.logger.verbose(`Rendering module ${this.id}`)
    const md = await this.render()
    this.md = md
    this.needsRender = false
    return md
  }
}
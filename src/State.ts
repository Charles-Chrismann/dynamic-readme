import * as fs from 'fs/promises'
import { ConfigSchema } from './zod.zodobject';
import {
  AbstractModule,
  ElementStaticModule,
  RawStaticModule,
  GreetingStaticModule,
  ProfileViewsStaticModule,
  GbaDynamicModule,
  FollowersDynamicModule,
  LinesStaticModule,
  ListStaticModule,
  SkillsStaticModule,
  SocialsStaticModule,
  GeneratedDynamicModule,
  TriggerStaticModule,
  WordleDynamicModule,
} from './modules';
import { MinesweeperDynamicModule } from './modules/dynamics/minesweeper.module';
import { ChessDynamicModule } from './modules/dynamics/chess.module';
import { AppConfigService } from './services';

type ModuleConstructor<TData = any, TOptions = any> = new (data: TData, options?: TOptions) => AbstractModule<TData, TOptions>;

class State {
  public modules: AbstractModule[] = []
  public startRenderDTimestamp: number

  async init(conf?: Record<string, any>) {
    const unsafe_config = conf ?? JSON.parse((await fs.readFile('./config.json')).toString())
    const config = ConfigSchema.parse(unsafe_config)

    const modules = new Map<string, ModuleConstructor>([
      ["static/element", ElementStaticModule],
      ["static/raw", RawStaticModule],
      ["static/greeting", GreetingStaticModule],
      ["static/profile-views", ProfileViewsStaticModule],
      ["static/lines", LinesStaticModule],
      ["static/list", ListStaticModule],
      ["static/socials", SocialsStaticModule],
      ["static/skills", SkillsStaticModule],
      ["static/trigger", TriggerStaticModule],
      ["dynamic/gba", GbaDynamicModule],
      ["dynamic/followers", FollowersDynamicModule],
      ["dynamic/generated", GeneratedDynamicModule],
      ["dynamic/wordle", WordleDynamicModule],
      ["dynamic/minesweeper", MinesweeperDynamicModule],
      ["dynamic/chess", ChessDynamicModule],
    ])

    const moduleInitPromises = []

    for(const element of config.structure) {
      if("disabled" in element && element.disabled) continue

      const module = modules.get(element.id)
      if(!module) {
        console.log(`Unknown module: ${element.id}`)
        continue
        throw new Error(`Unknown module: ${element.id}`)
      }

      const data = "data" in element ? element.data : {};
      const options = "options" in element ? element.options : {};
      const createdModule = new module(data, options)

      if("init" in createdModule) moduleInitPromises.push((createdModule.init as Function)())
      
      this.modules.push(createdModule)
    }
    await Promise.all(moduleInitPromises)
  }

  async render() {
    this.startRenderDTimestamp = Date.now()
    const renderPromises: (string | Promise<string>)[] = []
    
    for(const module of this.modules) {
      renderPromises.push(module.toMd())
    }

    const moduleStr = await Promise.all(renderPromises)

    return moduleStr.join('')
  }
}

export default new State()
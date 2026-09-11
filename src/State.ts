import { Config, ConfigSchema } from './zod.zodobject';
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
  AbstractDynamicModule,
} from './modules';
import { MinesweeperDynamicModule } from './modules/dynamics/minesweeper.module';
import { ChessDynamicModule } from './modules/dynamics/chess.module';
import { RequestService } from './services';
import {
  mkdir,
  readFile,
  rm,
  writeFile
} from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import { Response } from 'express';
import { ZipArchive } from 'archiver';
import unzipper from 'unzipper';
import { Readable } from 'stream';

type ModuleConstructor<TData = any, TOptions = any> = new (data: TData, options?: TOptions) => AbstractModule<TData, TOptions>;

type Paths<T> = T extends object
  ? {
      [K in keyof T & string]:
        NonNullable<T[K]> extends object
          ? K | `${K}.${Paths<NonNullable<T[K]>>}`
          : K
    }[keyof T & string]
  : never;

  type PathValue<T, P extends string> =
  P extends `${infer K}.${infer Rest}`
    ? K extends keyof NonNullable<T>
      ? PathValue<NonNullable<T>[K], Rest>
      : never
    : P extends keyof NonNullable<T>
      ? NonNullable<T>[P]
      : never;

class State {
  public modules: AbstractModule[] = []
  public startRenderTimestamp!: number
  private config: Config | null = null

  async getConfigOrDefaultOrNull(): Promise<Config | null> {
    const [customConfig, defaultConfig] = await Promise.allSettled([
      readFile('./config/datas/config.json', 'utf-8'),
      readFile('./config/datas/config.default.json', 'utf-8'),
    ])
    let conf = customConfig.status === 'fulfilled' ? customConfig.value
      : defaultConfig.status === 'fulfilled' ? defaultConfig.value : null

    if(conf !== null) {
      return ConfigSchema.parse(JSON.parse(conf))
    }

    return conf
  }

  async setConfig(unsafe_config: Record<string, any>) {
    const config = ConfigSchema.parse(unsafe_config)
    await writeFile(`./config/datas/config.json`, JSON.stringify(config))
    await this.init(config)
  }

  async init(unsafe_config: Record<string, any>) {
  
    const config = ConfigSchema.parse(unsafe_config)
    this.config = config

    if(this.config.datas.user) await RequestService.init()

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

    this.modules = []

    const moduleInitPromises: Promise<any>[] = []
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

      if (
        createdModule instanceof AbstractDynamicModule
        && createdModule.init
      ) {
        moduleInitPromises.push(createdModule.init());
      }
      
      this.modules.push(createdModule)
    }
    await Promise.all(moduleInitPromises)
    console.log(this.config)
  }

  async render() {

    if(!this.config) throw new Error('Config not set')

    this.startRenderTimestamp = Date.now()
    const renderPromises: (string | Promise<string>)[] = []
    
    for(const module of this.modules) {
      renderPromises.push(module.toMd())
    }

    const moduleStr = await Promise.all(renderPromises)

    return moduleStr.join('')
  }

  getConfig(): Config;
  getConfig<P extends Paths<Config>>(
    path: P
  ): NonNullable<PathValue<Config, P>>;
  getConfig<P extends Paths<Config>>(
    path?: P
  ): Config | NonNullable<PathValue<Config, P>> {
    if (!this.config) {
      throw new Error("Config not set");
    }

    if (path === undefined) {
      return this.config;
    }

    const value = path
      .split(".")
      .reduce(
        (acc: any, key) => acc?.[key],
        this.config
      ) as PathValue<Config, P>;

    if (value == null) {
      throw new Error(`Config key ${path} not set`);
    }

    return value as NonNullable<PathValue<Config, P>>;
  }

  async exportConfig(res: Response) {
    const archive = new ZipArchive({
      zlib: { level: 9 },
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="config.zip"',
    );

    archive.on('warning', (err) => {
      if (err.code !== 'ENOENT') {
        res.destroy(err);
      }
    });

    archive.on('error', (err) => {
      res.destroy(err);
    });

    archive.pipe(res);
    archive.directory(`./config`, false);

    await archive.finalize();
  }

  async importConfig(file: any) {
    await rm(`./config`, { recursive: true })

    await Readable.from(file.buffer)
      .pipe(unzipper.Extract({ path: `./` }))
      .promise();

    const config = await this.getConfigOrDefaultOrNull()
    
    if(config) {
      await this.init(config)
    }
  }
}

export default new State()
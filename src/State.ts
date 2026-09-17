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
  readdir,
  readFile,
  rm,
  writeFile
} from 'fs/promises';
import { Response } from 'express';
import { ZipArchive } from 'archiver';
import unzipper from 'unzipper';
import { Readable } from 'stream';
import { BadRequestException, Logger } from '@nestjs/common';
import { dirname, join } from 'path';
import { Cron } from '@nestjs/schedule';
import { SeparatorModule } from './modules/statics/separator.module';
import { CronJob } from 'cron';

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
  private logger = new Logger(State.name)
  private backupCron = new CronJob('0 0 0 * * *', () => this.backupData(), null, true)

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

    this.logger.log(`Setting new config: ${JSON.stringify(config)}`)

    await writeFile(`./config/datas/config.json`, JSON.stringify(config, null, 2))
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
      ["static/separator", SeparatorModule],
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

  async importConfig(file: Express.Multer.File) {
    const directory = './config';

    const zip = await unzipper.Open.buffer(file.buffer);
  
    // Recherche du dossier datas/
    const datasEntry = zip.files.find(
      (entry) =>
        entry.type === 'Directory' &&
        entry.path.split('/').filter(Boolean).at(-1) === 'datas',
    );
  
    if (!datasEntry) {
      throw new BadRequestException(
        'The archive does not contain a datas directory',
      );
    }
  
    // "foo/bar/datas/" -> "foo/bar/"
    const rootPath = datasEntry.path.slice(
      0,
      datasEntry.path.length - 'datas/'.length,
    );

    const files = new Map<string, Buffer>();
  
    for (const entry of zip.files) {
      if (
        entry.type !== 'File' ||
        !entry.path.startsWith(rootPath)
      ) {
        continue;
      }
  
      const relativePath = entry.path.slice(rootPath.length);
  
      if (!relativePath) {
        continue;
      }
  
      files.set(relativePath, await entry.buffer());
    }
  
    await rm(directory, {
      recursive: true,
      force: true,
    });
  
    await mkdir(directory, {
      recursive: true,
    });
  
    for (const [relativePath, content] of files) {
      const destination = join(directory, relativePath);
  
      await mkdir(dirname(destination), {
        recursive: true,
      });
  
      await writeFile(destination, content);
    }
  
    const config = await this.getConfigOrDefaultOrNull();
  
    if (config) {
      await this.init(config);
    }

    this.logger.log(`Config successfully imported`)
  }

  async backupData() {

    const {
      BU_DISCORD_CHANNEL_ID,
      BU_DISCORD_TOKEN,
    } = process.env

    if(
      !BU_DISCORD_CHANNEL_ID
      || !BU_DISCORD_TOKEN
    ) {
      this.logger.log(`Incomplete discord backup configuration, skipping backp!`)
      return
    }
    
    const archive = new ZipArchive({
      zlib: { level: 9 },
    });
    const chunks: Buffer[] = [];

    archive.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    archive.directory('./config/datas', false);

    await archive.finalize();

    const buffer = Buffer.concat(chunks);

    const filename = 'datas.zip'
    const original_content_type = "application/zip"
    const file = new File(
      [buffer],
      filename,
      {
        type: 'application/zip',
      },
    );
    
    const attachmentsRes = await fetch(`https://discord.com/api/v9/channels/${BU_DISCORD_CHANNEL_ID}/attachments`, {
      method: 'POST',
      headers: {
        authorization: BU_DISCORD_TOKEN,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        files:[{
          filename:"config.zip",
          file_size:file.size,
          id:"6",
          is_clip:false,
          original_content_type:"application/zip"
        }]
      })
    })

    const attachmentsData: {
      attachments: {
        id: number
        upload_url: string
        upload_filename: string
      }[]
    } = await attachmentsRes.json()

    const { upload_url, upload_filename } = attachmentsData.attachments[0]

    await fetch(upload_url, {
      method: 'PUT',
      headers: {
        authorization: BU_DISCORD_TOKEN,
        'content-type': 'application/octet-stream',
        'content-length': buffer.length.toString(),
      },
      body: buffer
    })
    
    await fetch(`https://discord.com/api/v9/channels/${BU_DISCORD_CHANNEL_ID}/messages`, {
      method: 'POST',
      headers: {
        authorization: BU_DISCORD_TOKEN,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        attachments: [{
          filename,
          id: "0",
          original_content_type,
          uploaded_filename: upload_filename,
        }],
        mobile_network_type:"unknown",
        content:"",
        tts:false,
        flags:0
      })
    })

    this.logger.log(`Successfully saving ./config/datas on discord`)
  }
}

export default new State()
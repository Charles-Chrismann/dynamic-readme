import { Injectable } from '@nestjs/common';
import State from './State';
import { Config } from './zod.zodobject';

@Injectable()
export class AppService {
  async render() {
    const content = await State.render()

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    ${content}
</body>
</html>`
  }

  config() {
    let config: Config
    try {
      config = State.getConfig()
    } catch (err: unknown) {
      config = {structure: [], datas: {}}
    }
    const configStr = JSON.stringify(config, null, 2)
    return {
      configStr,
    }
  }
}

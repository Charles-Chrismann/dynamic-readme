import { Injectable } from '@nestjs/common';
import State from './State';

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
    const config = State.getConfig()
    const configStr = JSON.stringify(config, null, 2)
    return {
      configStr,
    }
  }
}

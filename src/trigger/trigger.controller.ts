import * as fs from 'fs/promises'
import { Controller,
    Get,
    Header,
    OnModuleInit,
    Res
} from '@nestjs/common';
import { Response } from 'express';
import { 
    ReadmeService,
    RequestService
} from 'src/services';

@Controller('trigger')
export class TriggerController implements OnModuleInit {
    private triggerImageBuffer: Buffer
    async onModuleInit() {
        this.triggerImageBuffer = await fs.readFile('./public/trigger.webp')
    }

    @Get()
    @Header('Content-Type', 'image/webp')
    @Header('Cache-Control', 'public, max-age=0')
    trigger(@Res() res: Response) {
        // return as soon as possible
        RequestService.getFollowers(3).then((followers) => {
            if(JSON.stringify(followers) !== JSON.stringify(RequestService.lastFollowers)) {
                RequestService.lastFollowers = followers
                ReadmeService.renderCommitAndPush(':alarm_clock: Update followers table')
            }
        })
        return res.send(this.triggerImageBuffer)
    }
}

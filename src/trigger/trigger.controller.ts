import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { ReadmeService } from 'src/readme/readme.service';
import { RequestService } from 'src/request/request.service';

@Controller('trigger')
export class TriggerController {
    constructor(
        private requestService: RequestService,
        private readMeService: ReadmeService,
    ) {}

    @Get()
    trigger(@Res() res: Response) {
        // return as soon as possible
        this.requestService.getFollowers(3).then((followers) => {
            if(JSON.stringify(followers) !== JSON.stringify(this.requestService.lastFollowers)) {
                this.requestService.lastFollowers = followers
                this.readMeService.commit()
            }
        })
        return res.sendFile(join(process.cwd(), 'public/trigger.webp'))
    }
}

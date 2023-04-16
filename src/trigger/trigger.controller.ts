import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller('trigger')
export class TriggerController {
    @Get()
    trigger(@Res() res: Response) {
        return res.sendFile(join(process.cwd(), 'public/trigger.webp'))
    }
}

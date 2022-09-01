import {Controller, Post, Response} from '@nestjs/common';

@Controller('reg')
export class RegController {
  constructor() {}

  @Post('log')
  async regUser(@Response() res) {
    return res.json({
      message: 'OK',
    });
  }
}

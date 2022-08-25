import {Controller, Get, HttpException, Query} from '@nestjs/common';
import {ExtensionService} from '../service/extension.service';

@Controller('ext')
export class ExtensionController {
  constructor(private readonly extensionService: ExtensionService) {}

  @Get('')
  async getSiteStatus(@Query('origin') origin: string) {
    if (
      !origin.match(/^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/) ||
      origin.length > 253
    ) {
      console.log('bad');
      throw new HttpException('Bad Request', 400);
    }
    return await this.extensionService.getSiteStatus(origin);
  }
}

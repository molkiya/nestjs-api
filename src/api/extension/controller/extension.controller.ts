import {Controller, Get, HttpException, Param} from '@nestjs/common';
import {ExtensionService} from '../service/extension.service';

@Controller('ext')
export class ExtensionController {
  constructor(private readonly extensionService: ExtensionService) {}

  @Get(':url')
  async getSiteInfo(@Param('url') url: string) {
    if (new URL(`https://${url}`).hostname !== url || url.length > 253) {
      throw new HttpException('No/invalid hostname send', 400);
    }
    return await this.extensionService.getSiteInfo(url);
  }

  @Get(':url/status')
  async getSiteStatus(@Param('url') url: string) {
    if (new URL(`https://${url}`).hostname !== url || url.length > 253) {
      throw new HttpException('No/invalid hostname send', 400);
    }
    return await this.extensionService.getSiteStatus(url);
  }
}

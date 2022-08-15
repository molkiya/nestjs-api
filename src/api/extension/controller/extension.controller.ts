import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ExtensionService } from '../service/extension.service';

@Controller('extension')
export class ExtensionController {
  constructor(private readonly extensionService: ExtensionService) {}

  @Get(':url')
  getSiteInfo(@Param('url') url: string) {
    if (new URL(`https://${url}`).hostname !== url || url.length > 253) {
      throw new HttpException(
        'No/invalid hostname send',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.extensionService.getSiteInfo(url);
  }

  @Get(':url/status')
  getSiteStatus(@Param('url') url: string) {
    if (new URL(`https://${url}`).hostname !== url || url.length > 253) {
      throw new HttpException(
        'No/invalid hostname send',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.extensionService.getSiteStatus(url);
  }
}

import {Body, Controller, Get, HttpException, Inject, Post, Query} from '@nestjs/common';
import {SECONDS_HOUR_MILLISEC} from '../../utils/enum.utils';
import {GREEN} from '../../utils/icons.utils';
import {ExtensionService} from '../service/extension.service';
import {assignSiteDto, getSiteDto} from '../../dto/getSite.dto';

@Controller('ext')
export class ExtensionController {
  constructor(
    @Inject(ExtensionService)
    private readonly sitesService: ExtensionService,
  ) {}

  @Get('')
  async getSite(@Query('origin') origin: string, @Body() body: getSiteDto) {
    if (
      !origin.match(/^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/) ||
      origin.length > 253
    ) {
      throw new HttpException('Bad Request', 400);
    }
    const site = await this.sitesService.getSite(origin);

    if (site) {
      return this.sitesService.updateSiteInfo(site, SECONDS_HOUR_MILLISEC, `./icons/${GREEN}.png`);
    }

    const newSite = await this.sitesService.createSite(origin, body.email);
    return this.sitesService.updateSiteInfo(newSite, SECONDS_HOUR_MILLISEC, `./icons/${GREEN}.png`);
  }

  @Post('assign')
  async assignSite(@Body() body: assignSiteDto) {
    if (!body.origin || !body.email) {
      throw new HttpException('Bad Request', 400);
    }

    if (
      !body.origin.match(/^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/) ||
      body.origin.length > 253
    ) {
      throw new HttpException('Bad Request', 400);
    }
    // TODO: MongoDB caching update
    await this.sitesService.assignSite(body.origin, body.email);
    return {message: 'OK'};
  }
}

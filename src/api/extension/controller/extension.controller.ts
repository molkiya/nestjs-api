import {Body, Controller, Get, HttpException, Inject, Post, Query, Response} from '@nestjs/common';
import {SECONDS_HOUR_MILLISEC} from '../../utils/enum.utils';
import {GREEN} from '../../utils/icons.utils';
import {ExtensionService} from '../service/extension.service';
import {assignSiteDto} from '../../dto/getSite.dto';

@Controller('ext')
export class ExtensionController {
  constructor(
    @Inject(ExtensionService)
    private readonly sitesService: ExtensionService,
  ) {}

  @Get('')
  async getSite(@Query('origin') origin: string, @Response() res) {
    const email = res.locals.email;
    if (!email) {
      throw new HttpException('Bad Request / Invalid Token', 400);
    }
    if (
      !origin.match(/^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/) ||
      origin.length > 253
    ) {
      throw new HttpException('Bad Request', 400);
    }

    const site = await this.sitesService.getSite(origin);
    if (site) {
      const updated = this.sitesService.updateSiteInfo(site, SECONDS_HOUR_MILLISEC, `./icons/${GREEN}.png`);
      return res.json(updated);
    }

    const newSite = await this.sitesService.createSite(origin, email);
    const updateSite = this.sitesService.updateSiteInfo(newSite, SECONDS_HOUR_MILLISEC, `./icons/${GREEN}.png`);
    return res.json(updateSite);
  }

  @Post('assign')
  async assignSite(@Body() body: assignSiteDto, @Response() res) {
    const email = res.locals.email;
    if (!body.origin || !email) {
      throw new HttpException('Bad Request', 400);
    }

    if (
      !body.origin.match(/^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/) ||
      body.origin.length > 253
    ) {
      throw new HttpException('Bad Request', 400);
    }
    // TODO: MongoDB caching update
    await this.sitesService.assignSite(body.origin, email);
    res.json({message: 'OK'});
  }
}

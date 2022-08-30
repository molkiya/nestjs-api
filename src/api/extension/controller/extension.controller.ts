import {Body, Controller, Get, HttpException, Inject, Post, Query, Response} from '@nestjs/common';
import {GREEN} from '../../utils/icons.utils';
import {ExtensionService} from '../service/extension.service';
import {assignSiteDto} from '../../dto/getSite.dto';
import Redis from 'ioredis';

@Controller('ext')
export class ExtensionController {
  constructor(
    @Inject(ExtensionService)
    private readonly sitesService: ExtensionService,
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  @Get('')
  async getSite(@Query('origin') origin: string, @Response() res) {
    if (!res.locals.email) {
      throw new HttpException('Bad Request / Invalid Token', 400);
    }

    if (
      !origin.match(/^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/) ||
      origin.length > 253
    ) {
      throw new HttpException('Bad Request', 400);
    }

    const redisResult = await this.redis.get(origin);

    if (redisResult) {
      console.log('redisResult', redisResult);
      const updated = await this.sitesService.updateSiteInfo(JSON.parse(redisResult), `./icons/${GREEN}.png`, 1);
      return res.json(updated);
    }

    const site = await this.sitesService.getSite(origin);

    if (site) {
      await this.redis.set(origin, JSON.stringify(site));
      await this.sitesService.cacheSite(origin, site);
      const updated = await this.sitesService.updateSiteInfo(site, `./icons/${GREEN}.png`, 1);
      return res.json(updated);
    }

    const newSite = await this.sitesService.createSite(origin, res.locals.email);
    await this.sitesService.cacheSite(origin, newSite);
    const updateSite = await this.sitesService.updateSiteInfo(newSite, `./icons/${GREEN}.png`);
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
    const newSite = await this.sitesService.assignSite(body.origin, email);
    const updateSite = await this.sitesService.updateSiteInfo(newSite, `./icons/${GREEN}.png`, 1);
    return res.json(updateSite);
  }
}

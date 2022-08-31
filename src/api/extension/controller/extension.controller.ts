import {Body, Controller, Get, HttpException, Inject, Post, Query, Response} from '@nestjs/common';
import {ExtensionService} from '../service/extension.service';
import {assignSiteDto} from '../../dto/getSite.dto';
import Redis from 'ioredis';
import {Db} from 'mongodb';

@Controller('ext')
export class ExtensionController {
  constructor(
    @Inject(ExtensionService)
    private readonly sitesService: ExtensionService,
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
    @Inject('MONGODB_CONNECTION')
    private readonly mongodb: Db,
  ) {}

  @Get('')
  async getSite(@Query('origin') origin: string, @Response() res) {
    const accountId: number = res.locals.account;

    if (
      !origin.match(/^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/) ||
      origin.length > 253
    ) {
      throw new HttpException('Bad Request', 400);
    }

    const redisResult = await this.redis.get(new URL(origin).hostname);

    if (redisResult) {
      console.log('redisSite:    ', redisResult);
      const site = JSON.parse(redisResult);
      await this.mongodb.collection('sites').insertOne({
        ...site.site,
      });
      return res.json(JSON.parse(redisResult));
    }

    const site = await this.sitesService.getSite(origin);

    if (site.rows.length) {
      console.log('foundSite:    ', site.rows.length);
      const responseSite = await this.sitesService.cacheSite(origin, site.rows[0]);
      await this.mongodb.collection('sites').insertOne({
        ...responseSite,
      });
      return res.json({
        site: responseSite,
      });
    }

    const newSite = await this.sitesService.createSite(origin, accountId);
    console.log('createdSite:      ', newSite.rows[0]);
    const responseSite = await this.sitesService.cacheSite(origin, newSite.rows[0]);
    await this.mongodb.collection('sites').insertOne({
      ...responseSite,
    });
    return res.json({
      site: responseSite,
    });
  }

  @Post('assign')
  async assignSite(@Body() body: assignSiteDto, @Response() res) {
    if (
      !body.origin.match(/^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/) ||
      body.origin.length > 253
    ) {
      throw new HttpException('Bad Request', 400);
    }

    const result = await this.sitesService.assignSite(body.origin, res.locals.account);
    console.log(result);
    const updatedSiteCached = await this.sitesService.cacheSite(body.origin, result.rows[0]);
    await this.mongodb.collection('sites').insertOne({
      ...updatedSiteCached,
    });
    return res.json({
      site: updatedSiteCached,
    });
  }
}

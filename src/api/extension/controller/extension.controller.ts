import {Body, Controller, Get, HttpException, Inject, Post, Query, Response} from '@nestjs/common';
import {ExtensionService} from '../service/extension.service';
import {assignSiteDto} from '../../dto/getSite.dto';
import {InjectModel} from '@nestjs/mongoose';
import {CachedSite, CachedSiteDocument} from '../../schemas/site.schema';
import {Model} from 'mongoose';

@Controller('ext')
export class ExtensionController {
  constructor(
    @Inject(ExtensionService)
    private readonly sitesService: ExtensionService,
    @InjectModel(CachedSite.name) private readonly cachedSiteModel: Model<CachedSiteDocument>,
  ) {}

  @Get('')
  async getSite(@Query('origin') origin: string, @Response() res) {
    const accountId: number = res.locals.account;
    if (
      !origin.match(/^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/) ||
      origin.length > 253
    ) {
      console.log('bad');
      throw new HttpException('Bad Request', 400);
    }

    // const cachedSite = await this.cachedSiteModel.findOne({'site.fqdn': origin});

    // if (cachedSite) {
    //   return res.json(cachedSite);
    // }

    // console.log(cachedSite);

    const site = await this.sitesService.getSite(origin);

    if (site.rows.length) {
      // const updated = await this.sitesService.updateSiteInfo(site, SECONDS_HOUR_MILLISEC, `./icons/${GREEN}.png`, 1);
      return res.json(site.rows);
    }

    const newSite = await this.sitesService.createSite(origin, accountId);
    // const updateSite = await this.sitesService.updateSiteInfo(newSite, SECONDS_HOUR_MILLISEC, `./icons/${GREEN}.png`);
    return res.json(newSite);
  }

  @Post('assign')
  async assignSite(@Body() body: assignSiteDto, @Response() res) {
    const accountId = res.locals.account;
    // if (!body.origin || !accountId) {
    //   throw new HttpException('Bad Request', 400);
    // }

    if (
      !body.origin.match(/^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/) ||
      body.origin.length > 253
    ) {
      throw new HttpException('Bad Request', 400);
    }
    const result = await this.sitesService.assignSite(body.origin, accountId);
    // const updatedSiteCached = await this.sitesService.updateSiteCache(body.origin, 1);
    return res.json(result.rows[0]);
  }
}

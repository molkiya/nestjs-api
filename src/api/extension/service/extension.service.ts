import {HttpException, Inject, Injectable} from '@nestjs/common';

import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import Redis from 'ioredis';

import WhoisEntity from '../entities/entities/whois.entity';
import SitesEntity from '../entities/entities/sites.entity';
import {GREEN} from '../../utils/icons.utils';
import {SECONDS_HOUR_MILLISEC} from '../../utils/enum.utils';
import {SiteStatus} from '../../../utils/status.utils';
import {SiteTitle} from '../../../utils/title.utils';
import {InjectModel} from '@nestjs/mongoose';
import {CachedSite, CachedSiteDocument} from '../../schemas/site.schema';
import {Model} from 'mongoose';

@Injectable()
export class ExtensionService {
  constructor(
    @InjectRepository(SitesEntity)
    private sitesRepository: Repository<SitesEntity>,
    @InjectRepository(WhoisEntity)
    private whoisRepository: Repository<WhoisEntity>,
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
    @InjectModel(CachedSite.name) private readonly cachedSiteModel: Model<CachedSiteDocument>,
  ) {}

  public async getSiteStatus(name: string) {
    const cachedSite = await this.cachedSiteModel.findOne({'site.fqdn': name});

    if (cachedSite) {
      return cachedSite;
    }

    const item = await this.sitesRepository.findOne({
      where: {
        fqdn: name,
      },
    });

    if (item) {
      const whois = await this.whoisRepository.findOne({
        where: {
          site_id: item.id,
        },
        order: {
          ts: 'DESC',
        },
      });
      await this.updateSite(
        {
          site: item,
          whois: whois,
        },
        SECONDS_HOUR_MILLISEC,
        `./icons/${GREEN}.png`,
      );
      return {
        site: item,
        whois: whois,
      };
    }

    const site = await this.createSite(name);
    return await this.updateSite(site, SECONDS_HOUR_MILLISEC, `./icons/${GREEN}.png`);
  }

  private async updateSite(site: any, ttl: number, path: string) {
    site.site['ttl'] = ttl;
    site.site.path = path;
    await this.cachedSiteModel.create(site);
    return site;
  }

  private async createSite(name: string) {
    const request = {
      data: {
        test: name,
      },
    };

    if (!request.data) {
      throw new HttpException('Whois server not working', 500);
    }

    const site = await this.sitesRepository
      .createQueryBuilder()
      .insert()
      .into(SitesEntity)
      .values({
        fqdn: name,
        created_by: 1,
        status: SiteStatus.NEW,
        title: SiteTitle.READY,
      })
      .returning('*')
      .execute();

    const whois = await this.whoisRepository
      .createQueryBuilder()
      .insert()
      .into(WhoisEntity)
      .values({
        raw: request.data,
        site_id: site.generatedMaps[0].id,
      })
      .returning('*')
      .execute();

    return {
      site: site.generatedMaps[0],
      whois: whois.generatedMaps[0],
    };
  }
}

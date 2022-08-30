import {HttpException, Inject, Injectable} from '@nestjs/common';

import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import Redis from 'ioredis';
import {SiteStatus} from '../../../utils/status.utils';
import {SiteTitle} from '../../../utils/title.utils';
import SitesEntity from '../../entities/entities/sites.entity';
import WhoisEntity from '../../entities/entities/whois.entity';
import {Db} from 'mongodb';
import {DAY_MILLISEC, MINUTE_MILLISEC} from '../../utils/enum.utils';

@Injectable()
export class ExtensionService {
  constructor(
    @InjectRepository(SitesEntity)
    private sitesRepository: Repository<SitesEntity>,
    @InjectRepository(WhoisEntity)
    private whoisRepository: Repository<WhoisEntity>,
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
    @Inject('MONGODB_CONNECTION')
    private readonly mongodb: Db,
  ) {}

  public async getSite(origin: string) {
    const site = await this.sitesRepository.findOne({
      where: {
        fqdn: origin,
      },
    });

    if (!site) {
      return null;
    }

    const whois = await this.whoisRepository.findOne({
      where: {
        site_id: site.id,
      },
      order: {
        ts: 'DESC',
      },
    });
    return {
      site: site,
      whois: whois,
    };
  }

  public async assignSite(origin: string, email: string) {
    const site = await this.sitesRepository.findOne({
      where: {
        fqdn: origin,
      },
    });

    if (!site) {
      throw new HttpException('Site not exist', 401);
    }

    if (site.assigned_by) {
      throw new HttpException('Site already assigned', 406);
    }

    // TODO: Create Users table
    const emailNumber = 1;

    return await this.sitesRepository.update(site.id, {
      assigned_by: emailNumber,
    });
  }

  public async createSite(origin: string, email: string) {
    const request = {
      data: {
        test: origin,
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
        fqdn: origin,
        created_by: email,
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

  public async updateSiteInfo(site: any, assigned_by = null) {
    site.site['ttl'] = this.setTTL(site);
    site.site.path = setT;
    site.site.assigned_by = assigned_by;
    await this.mongodb.collection('sites').insertOne(site);
    return site;
  }

  public async cacheSite(origin: string, site) {
    const resultTtl = this.setTTL(site);
    await this.redis.expire(origin, resultTtl);
  }

  private setTTL(site: any) {
    switch (site.site.status) {
      case 'NEW':
        return (site.site.ttl = this.seconds_since_epoch(MINUTE_MILLISEC));
      case 'SUP':
        return (site.site.ttl = this.seconds_since_epoch(DAY_MILLISEC) * 30);
      default:
        return (site.site.ttl = this.seconds_since_epoch(MINUTE_MILLISEC));
    }
  }

  private setIcon(site: any) {
    switch (site.site.status) {
      case 'NEW':
        return (site.site.ttl = this.seconds_since_epoch(MINUTE_MILLISEC));
      case 'SUP':
        return (site.site.ttl = this.seconds_since_epoch(DAY_MILLISEC) * 30);
      default:
        return (site.site.ttl = this.seconds_since_epoch(MINUTE_MILLISEC));
    }
  }

  private seconds_since_epoch(d): number {
    return Math.floor(d / 1000);
  }
}

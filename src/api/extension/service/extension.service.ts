import {HttpException, Inject, Injectable} from '@nestjs/common';

import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import Redis from 'ioredis';

import WhoisEntity from '../../entities/entities/whois.entity';
import SitesEntity from '../../entities/entities/sites.entity';

@Injectable()
export class ExtensionService {
  constructor(
    @InjectRepository(SitesEntity)
    private sitesRepository: Repository<SitesEntity>,
    @InjectRepository(WhoisEntity)
    private whoisRepository: Repository<WhoisEntity>,
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
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

    console.log(site);

    if (!site) {
      throw new HttpException('Site not exist', 401);
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
        status: 'NEW',
        title: 'Ready for work',
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

  public updateSiteInfo(site: any, ttl: number, path: string) {
    site.site['ttl'] = ttl;
    site.site.path = path;
    return site;
  }
}

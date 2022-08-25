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

  public async getSite(name: string) {
    const site = await this.sitesRepository.findOne({
      where: {
        fqdn: name,
      },
    });

    if (!site) return false;

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

  public async createSite(name: string) {
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

  public updateSite(site: any, ttl: number, path: string) {
    site.site['ttl'] = ttl;
    site.site.path = path;
    return site;
  }
}

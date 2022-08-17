import {HttpException, Inject, Injectable} from '@nestjs/common';

import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import Redis from 'ioredis';

import WhoisEntity from '../entities/entities/whois.entity';
import SitesEntity from '../entities/entities/sites.entity';
import {SECONDS_HOUR} from '../../utils/enum.utils';

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

  public async getSiteStatus(name: string) {
    const cachedSite = await this.redis.get(name);
    if (cachedSite) {
      return cachedSite;
    } else {
      const item = await this.sitesRepository.findOne({
        where: {
          fqdn: name,
        },
      });

      if (!item) {
        const result = await this.createSiteAndGetDataInDB(name);
        const value = Buffer.from(JSON.stringify(result));
        await this.redis.set(name, value, 'EX', Number(SECONDS_HOUR));
        return result;
      } else {
        const whois = await this.whoisRepository.findOne({
          where: {
            site_id: item.id,
          },
          order: {
            ts: 'DESC',
          },
        });
        return {site: item, whois: whois};
      }
    }
  }

  private async createSiteAndGetDataInDB(name: string) {
    const request = {data: {test: name}};

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

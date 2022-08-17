import {HttpException, HttpStatus, Inject, Injectable} from '@nestjs/common';

import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';

import WhoisEntity from '../entities/whois.entity';
import SitesEntity from '../entities/sites.entity';
import Redis from 'ioredis';

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

  async getSiteInfo(name: string) {
    const item = await this.sitesRepository.findOne({
      where: {
        fqdn: name,
      },
    });

    if (!item) {
      return await this.createSiteAndGetDataInDB(name);
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

  async getSiteStatus(name: string) {
    const item = await this.sitesRepository.findOne({
      where: {
        fqdn: name,
      },
    });

    if (!item) {
      return {status: 'NOT EXIST'};
    } else {
      return {status: item.status};
    }
  }

  async createSiteAndGetDataInDB(name: string) {
    const request = {data: {test: name}};

    if (!request.data) {
      throw new HttpException('Whois server not working', HttpStatus.BAD_REQUEST);
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

    const el = await this.whoisRepository
      .createQueryBuilder()
      .insert()
      .into(WhoisEntity)
      .values({
        raw: request.data,
        site_id: site.generatedMaps[0].id,
      })
      .returning('*')
      .execute();

    return {site: site.generatedMaps[0], whois: el.generatedMaps[0]};
  }
}

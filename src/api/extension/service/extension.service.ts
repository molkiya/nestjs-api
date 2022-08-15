import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SitesEntity } from '../entities/sites.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhoisEntity } from '../entities/whois.entity';

@Injectable()
export class ExtensionService {
  constructor(
    @InjectRepository(SitesEntity)
    private sitesRepository: Repository<SitesEntity>,
    @InjectRepository(WhoisEntity)
    private whoisRepository: Repository<WhoisEntity>,
  ) {}

  async getSiteInfo(name: string) {
    let item = await this.sitesRepository.findOne({
      where: {
        fqdn: name,
      },
    });

    if (!item) {
      return await this.createSiteAndGetDataInDB(name);
    } else {
      let whois = await this.whoisRepository.findOne({
        where: {
          site_id: item.id,
        },
        order: {
          ts: 'DESC',
        },
      });
      return { site: item, whois: whois };
    }
  }

  async getSiteStatus(name: string) {
    let item = await this.sitesRepository.findOne({
      where: {
        fqdn: name,
      },
    });

    if (!item) {
      return { status: 'NOT EXIST' };
    } else {
      return { status: item.status };
    }
  }

  async createSiteAndGetDataInDB(name: string) {
    let request = { data: { test: name } };

    if (!request.data) {
      throw new HttpException(
        'Whois server not working',
        HttpStatus.BAD_REQUEST,
      );
    }

    let site = await this.sitesRepository
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

    let el = await this.whoisRepository
      .createQueryBuilder()
      .insert()
      .into(WhoisEntity)
      .values({
        raw: request.data,
        site_id: site.generatedMaps[0].id,
      })
      .returning('*')
      .execute();

    return { site: site.generatedMaps[0], whois: el.generatedMaps[0] };
  }
}

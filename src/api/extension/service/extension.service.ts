import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SitesEntity } from '../entities/sites.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhoisEntity } from '../entities/whois.entity';

@Injectable()
export class ExtensionService {
  constructor(
    @InjectRepository(SitesEntity)
    private extensionRepository: Repository<SitesEntity>,
    @InjectRepository(WhoisEntity)
    private whoisRepository: Repository<WhoisEntity>,
  ) {}

  async getSiteInfo(name: string) {
    let item = await this.extensionRepository.findOne({
      where: {
        fqdn: name,
      },
      relations: ['whois'],
    });

    if (!item) {
      return await this.createSiteInDB(name);
    } else {
      return item.whois[0];
    }
  }

  async createSiteInDB(name: string) {
    let site = await this.extensionRepository
      .createQueryBuilder()
      .insert()
      .into(SitesEntity)
      .values([{ fqdn: name }])
      .returning('*')
      .execute();

    return await this.getDataFromWhois(site.generatedMaps[0].id, name);
  }

  async getDataFromWhois(id: number, name: string) {
    let request = { data: { test: name } };

    if (!request.data) {
      throw new HttpException('Whois server not working', HttpStatus.NOT_FOUND);
    }

    let el = await this.whoisRepository
      .createQueryBuilder()
      .insert()
      .into(WhoisEntity)
      .values([{ raw: request.data, site_id: id }])
      .returning('*')
      .execute();

    return el.generatedMaps[0];
  }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SitesEntity } from '../entities/sites.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ExtensionService {
  constructor(
    @InjectRepository(SitesEntity)
    private hostsRepository: Repository<SitesEntity>,
  ) {}

  async getSiteInfo(name: string) {
    let item = await this.hostsRepository.findOne({
      where: {
        fqdn: name,
      },
    });

    if (!item) {
      await this.getDataFromWhois(name);
    }

    return item;
  }

  async getDataFromWhois(name: string) {
    let request = { data: { test: 'test' } };

    if (!request.data) {
      throw new HttpException('Whois server not working', HttpStatus.NOT_FOUND);
    }

    let el = await this.hostsRepository
      .createQueryBuilder()
      .insert()
      .into(SitesEntity)
      .values([{ fqdn: name }])
      .returning('*')
      .execute();

    return el.generatedMaps[0];
  }
}

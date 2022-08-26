import {InjectRepository} from '@nestjs/typeorm';
import SitesEntity from '../../entities/entities/sites.entity';
import {Repository} from 'typeorm';
import WhoisEntity from '../../entities/entities/whois.entity';
import {Inject} from '@nestjs/common';
import Redis from 'ioredis';

export class ClientService {
  constructor(
    @InjectRepository(SitesEntity)
    private sitesRepository: Repository<SitesEntity>,
    @InjectRepository(WhoisEntity)
    private whoisRepository: Repository<WhoisEntity>,
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  public async uploadData(data, stream) {
    console.log(stream);
  }
}

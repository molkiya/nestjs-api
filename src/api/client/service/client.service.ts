import {Inject} from '@nestjs/common';
import Redis from 'ioredis';

export class ClientService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  public async uploadFromFile(files, accountId, suppress, cabinet) {}

  public async uploadFromBody(domainList, accountId, suppress, cabinet) {}
}

import {Inject} from '@nestjs/common';
import Redis from 'ioredis';
import {PoolClient} from 'pg';

export class ClientService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
    @Inject('PG_CONNECTION')
    private readonly pg: PoolClient,
  ) {}

  public async getSiteInfo(hostname) {
    return this.pg.query('SELECT * FROM sites WHERE fqdn = $1::text', [hostname]);
  }

  public async createSiteInfo(hostname, accountId, suppress = false, cabinet = false) {
    await this.pg.query(
      'INSERT INTO sites (fqdn, created_by, suppress, cabinet) VALUES ($1::text, $2::integer, $3::boolean, $4::boolean)',
      [hostname, accountId, suppress, cabinet],
    );
    return;
  }
}

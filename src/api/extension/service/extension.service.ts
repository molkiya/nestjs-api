import {HttpException, Inject, Injectable} from '@nestjs/common';
import Redis from 'ioredis';
import {Db} from 'mongodb';
import {DAY_MILLISEC, MINUTE_MILLISEC, WEEK_MILLISEC} from '../../utils/enum.utils';
import StatusEnum from '../../utils/status.utils';
import TitleEnum from '../../utils/title.utils';
import PathEnum from '../../utils/icons.utils';
import {PoolClient} from 'pg';

@Injectable()
export class ExtensionService {
  constructor(
    @Inject('PG_CONNECTION')
    private readonly pg: PoolClient,
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
    @Inject('MONGODB_CONNECTION')
    private readonly mongodb: Db,
  ) {}

  public async getSite(origin: string) {
    return await this.pg.query('SELECT * FROM sites WHERE fqdn = $1::text', [new URL(origin).hostname]);
  }

  public async assignSite(origin: string, accountId: number) {
    const url = new URL(origin);
    const site = await this.pg.query('SELECT * FROM sites WHERE fqdn = $1::text', [url.hostname]);

    if (!site.rows[0]) {
      throw new HttpException('Site not exist', 401);
    }

    if (site.rows[0].assigned_by) {
      throw new HttpException('Site already assigned', 406);
    }

    await this.pg.query('UPDATE sites SET assigned_by = $1::integer, assigned_at = NOW() WHERE fqdn = $2::text', [
      accountId,
      url.hostname,
    ]);

    return await this.pg.query('SELECT * FROM sites WHERE fqdn = $1::text', [url.hostname]);
  }

  public async createSite(origin: string, accountId: number, suppress = false, cabinet = false) {
    const url = new URL(origin);
    await this.pg.query(
      'INSERT INTO sites (fqdn, created_by, suppress, cabinet) VALUES ($1::text, $2::integer, $3::boolean, $4::boolean)',
      [url.hostname, accountId, suppress, cabinet],
    );
    return await this.pg.query('SELECT * FROM sites WHERE fqdn = $1::text', [url.hostname]);
  }

  public async cacheSite(origin: string, site: any) {
    const resultTtl = this.setTTL(site);
    console.log(resultTtl);
    await this.redis.set(
      new URL(origin).hostname,
      JSON.stringify({
        site: {
          ...site,
          ...resultTtl,
        },
      }),
    );
    await this.redis.expire(new URL(origin).hostname, Math.floor(resultTtl.ttl / 1000));
    return {
      ...site,
      ...resultTtl,
    };
  }

  public setTTL(site: any) {
    if (site.suppress) {
      return {
        status: StatusEnum.SUP,
        ttl: DAY_MILLISEC * 30,
        title: TitleEnum.SUP,
        path: `./icons/${PathEnum.RED}.png`,
      };
    }

    if (site.cabinet) {
      return {
        status: StatusEnum.CAB,
        ttl: WEEK_MILLISEC,
        title: TitleEnum.CAB,
        path: `./icons/${PathEnum.ORANGE}.png`,
      };
    }

    if (site.assigned_by) {
      return {
        status: StatusEnum.WIP,
        ttl: WEEK_MILLISEC,
        title: TitleEnum.WIP,
        path: `./icons/${PathEnum.BROWN}.png`,
      };
    }

    if (!site.suppress && !site.cabinet && !site.assigned_by) {
      return {
        status: StatusEnum.NEW,
        ttl: MINUTE_MILLISEC,
        title: TitleEnum.NEW,
        path: `./icons/${PathEnum.GREEN}.png`,
      };
    }

    return {
      status: StatusEnum.TRASH,
      ttl: 0,
      title: TitleEnum.TRASH,
      path: `./icons/${PathEnum.TRASH}.png`,
    };
  }
}

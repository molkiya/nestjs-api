import {HttpException, Inject, Injectable} from '@nestjs/common';
import Redis from 'ioredis';
import {PG_CONNECTION} from '../../utils/pgConnection';
import {Db} from 'mongodb';
import {DAY_MILLISEC, MINUTE_MILLISEC, WEEK_MILLISEC} from '../../utils/enum.utils';
import StatusEnum from '../../utils/status.utils';
import TitleEnum from '../../utils/title.utils';
import PathEnum from '../../utils/icons.utils';

@Injectable()
export class ExtensionService {
  constructor(
    @Inject(PG_CONNECTION)
    private readonly pg: any,
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
    @Inject('MONGODB_CONNECTION')
    private readonly mongodb: Db,
  ) {}

  public async getSite(origin: string) {
    return await this.pg.query(`SELECT * FROM sites WHERE fqdn = '${new URL(origin).hostname}'`);
  }

  public async assignSite(origin: string, accountId: number) {
    const url = new URL(origin);
    const site = await this.pg.query(`SELECT * FROM sites WHERE fqdn = '${url.hostname}'`);

    if (!site.rows[0]) {
      throw new HttpException('Site not exist', 401);
    }

    if (site.rows[0].assigned_by) {
      throw new HttpException('Site already assigned', 406);
    }

    await this.pg.query(
      `UPDATE sites SET assigned_by = ${accountId}, assigned_at = NOW() WHERE fqdn = '${url.hostname}'`,
    );

    return await this.pg.query(`SELECT * FROM sites WHERE fqdn = '${url.hostname}'`);
  }

  public async createSite(origin: string, accountId: number) {
    console.log(origin, accountId);
    const url = new URL(origin);
    let https = false;
    if (url.protocol === 'https:') https = !https;
    await this.pg.query(
      `INSERT INTO sites (fqdn, created_by, https, suppress, cabinet) VALUES ('${url.hostname}', ${accountId}, ${https}, false, false)`,
    );
    return await this.pg.query(`SELECT * FROM sites WHERE fqdn = '${url.hostname}'`);
  }

  public async cacheSite(origin: string, site: any) {
    const resultTtl = this.setTTL(site);
    await this.redis.set(
      new URL(origin).hostname,
      JSON.stringify({
        site: {
          ...site,
          ...resultTtl,
        },
      }),
    );
    await this.redis.expire(new URL(origin).hostname, this.seconds_since_epoch(resultTtl.ttl));
    return {
      ...site,
      ...resultTtl,
    };
  }

  public setTTL(site: any) {
    if (!site.site.suppress && !site.site.cabinet && !site.site.assigned_by) {
      return {
        status: StatusEnum.NEW,
        ttl: MINUTE_MILLISEC,
        title: TitleEnum.NEW,
        path: `./icons/${PathEnum.GREEN}.png`,
      };
    }

    if (site.site.suppress) {
      return {
        status: StatusEnum.SUP,
        ttl: DAY_MILLISEC * 30,
        title: TitleEnum.SUP,
        path: `./icons/${PathEnum.RED}.png`,
      };
    }

    if (site.site.cabinet) {
      return {
        status: StatusEnum.CAB,
        ttl: WEEK_MILLISEC,
        title: TitleEnum.CAB,
        path: `./icons/${PathEnum.ORANGE}.png`,
      };
    }

    if (site.site.assigned_by) {
      return {
        status: StatusEnum.WIP,
        ttl: WEEK_MILLISEC,
        title: TitleEnum.WIP,
        path: `./icons/${PathEnum.BROWN}.png`,
      };
    }

    return {
      status: StatusEnum.TRASH,
      ttl: 0,
      title: TitleEnum.TRASH,
      path: `./icons/${PathEnum.TRASH}.png`,
    };
  }

  private seconds_since_epoch(d): number {
    return Math.floor(d / 1000);
  }
}

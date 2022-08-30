import {HttpException, Inject, Injectable} from '@nestjs/common';
import Redis from 'ioredis';
import {InjectModel} from '@nestjs/mongoose';
import {CachedSite, CachedSiteDocument} from '../../schemas/site.schema';
import {Model} from 'mongoose';
import {PG_CONNECTION} from '../../utils/pgConnection';

@Injectable()
export class ExtensionService {
  constructor(
    @Inject(PG_CONNECTION)
    private readonly pg: any,
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
    @InjectModel(CachedSite.name) private readonly cachedSiteModel: Model<CachedSiteDocument>,
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

    const updatedSite = await this.pg.query(`SELECT * FROM sites WHERE fqdn = '${url.hostname}'`);
    return updatedSite;
  }

  public async createSite(origin: string, accountId: number) {
    console.log(origin, accountId);
    const url = new URL(origin);
    let https = false;
    if (url.protocol === 'https:') https = !https;
    await this.pg.query(
      `INSERT INTO sites (fqdn, created_by, https, suppress, cabinet) VALUES ('${url.hostname}', ${accountId}, ${https}, false, false)`,
    );
    const site = await this.pg.query(`SELECT * FROM sites WHERE fqdn = '${url.hostname}'`);
    console.log('createsite');
    return {
      site: site.rows[0],
    };
  }

  public async updateSiteCache(origin: string, assigned_by: number) {
    const updatedSite = await this.cachedSiteModel.findOneAndUpdate(
      {'site.fqdn': origin},
      {
        'site.assigned_by': assigned_by,
      },
      {new: true},
    );

    if (!updatedSite) {
      return new HttpException('Update site cache failed', 500);
    }
    return updatedSite;
  }

  public async updateSiteInfo(site: any, ttl: number, path: string, assigned_by = null) {
    site.site['ttl'] = ttl;
    site.site.path = path;
    site.site.assigned_by = assigned_by;
    // await this.cachedSiteModel.create(site);
    return site;
  }
}

import {HttpException, Inject, Injectable} from '@nestjs/common';
import Redis from 'ioredis';
import {SiteStatus} from '../../../utils/status.utils';
import {SiteTitle} from '../../../utils/title.utils';
import {InjectModel} from '@nestjs/mongoose';
import {CachedSite, CachedSiteDocument} from '../../schemas/site.schema';
import {Model} from 'mongoose';
import {PG_CONNECTION} from '../../utils/pgConnection';

@Injectable()
export class ExtensionService {
  constructor(
    @Inject(PG_CONNECTION)
    private conn: any,
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
    @InjectModel(CachedSite.name) private readonly cachedSiteModel: Model<CachedSiteDocument>,
  ) {}

  public async getSite(origin: string) {
    const site = await this.conn.query(`SELECT * FROM sites WHERE fqdn = '${origin}'`);

    console.log(site);

    if (!site[0]) {
      return null;
    }

    return {
      site: site[0],
    };
  }

  public async assignSite(origin: string, email: string) {
    const site = await this.conn.query(`SELECT * FROM sites WHERE fqdn = '${origin}'`);

    if (!site[0]) {
      throw new HttpException('Site not exist', 401);
    }

    if (site[0].assigned_by) {
      throw new HttpException('Site already assigned', 406);
    }

    // TODO: Create Users table
    const emailNumber = 1;

    await this.conn.query(`UPDATE sites SET assigned_by = ${emailNumber} WHERE fqdn = '${origin}'`);

    const updatedSite = await this.conn.query(`SELECT * FROM sites WHERE fqdn = '${origin}'`);
    return updatedSite[0];
  }

  public async createSite(origin: string, email: string) {
    const a = await this.conn.query(
      `INSERT INTO sites (fqdn, created_by, status, title) VALUES ('${origin}', '${email}', '${SiteStatus.NEW}', '${SiteTitle.READY}')`,
    );
    console.log(a);
    const site = await this.conn.query(`SELECT * FROM sites WHERE fqdn = '${origin}'`);

    return {
      site: site[0],
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
    await this.cachedSiteModel.create(site);
    return site;
  }
}

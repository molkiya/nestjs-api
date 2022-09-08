import {Inject, Injectable} from '@nestjs/common';
import Redis from 'ioredis';
import * as path from 'path';
import * as es from 'event-stream';
import {PoolClient} from 'pg';
import * as fs from 'fs';
import {AmqpConnection, RabbitSubscribe} from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class ClientService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
    @Inject('PG_CONNECTION')
    private readonly pg: PoolClient,
    private queue: AmqpConnection,
  ) {}

  @RabbitSubscribe({
    exchange: 'exchange1',
    queue: 'psl',
  })
  public async fileHandler(files, accountId, suppress, cabinet) {
    return new Promise((resolve, reject) => {
      if (!files.length) {
        reject({message: `File is empty`});
      }
      const existSites = [];
      const badSites = [];
      const goodSites = [];
      let lineNr = 0;
      const s = fs
        .createReadStream(path.join(__dirname, '../../../..', 'uploads', `${files[0].filename}`))
        .pipe(es.split())
        .pipe(
          es.mapSync(async (line) => {
            s.pause();
            lineNr += 1;
            const hostname = this.parseDomain(line);
            if (hostname) {
              const site = await this.pg.query('SELECT * FROM sites WHERE fqdn = $1::text', [hostname]);
              if (site.rows[0] && site.rows[0].fqdn === hostname) {
                existSites.push({
                  numberOfString: lineNr,
                  origin: line,
                });
              } else {
                await this.pg.query(
                  'INSERT INTO sites (fqdn, created_by, suppress, cabinet) VALUES ($1::text, $2::integer, $3::boolean, $4::boolean)',
                  [hostname, accountId, suppress, cabinet],
                );
                await this.queue.publish('', '', hostname, {
                  noAck: false,
                });
                goodSites.push({
                  numberOfString: lineNr,
                  origin: line,
                });
              }
              s.resume();
            } else {
              badSites.push({
                numberOfString: lineNr,
                origin: line,
              });
              s.resume();
            }
          }),
        )
        .on('end', async () => {
          await fs.rmSync(path.resolve(__dirname, '../../../..', 'uploads', `${files[0].filename}`));
          resolve({
            existsSites: {
              existSitesList: existSites,
              existSitesCount: existSites.length,
            },
            badSites: {
              badSitesList: badSites,
              badSitesCount: badSites.length,
            },
            goodSites: {
              goodSitesList: goodSites,
              goodSitesCount: goodSites.length,
            },
            type: 'file',
            message: `OK, parsed`,
          });
        });
    });
  }

  public async uploadFromFile(files, accountId, suppress = false, cabinet = false) {
    return await this.fileHandler(files, accountId, suppress, cabinet);
  }

  @RabbitSubscribe({
    exchange: 'exchange1',
    queue: 'psl',
  })
  public async uploadFromBody(domainList, accountId, suppress = false, cabinet = false) {
    if (!domainList.length) {
      return {message: `File is empty`};
    }
    const existSites = [];
    const badSites = [];
    const goodSites = [];
    let lineNr = 0;
    await Promise.all(
      domainList.map(async (domain) => {
        lineNr += 1;
        const hostname = this.parseDomain(domain);
        if (hostname) {
          const site = await this.pg.query('SELECT * FROM sites WHERE fqdn = $1::text', [hostname]);
          if (site.rows[0] && site.rows[0].fqdn === hostname) {
            existSites.push({
              numberOfString: lineNr,
              origin: domain,
            });
          } else {
            await this.pg.query(
              'INSERT INTO sites (fqdn, created_by, suppress, cabinet) VALUES ($1::text, $2::integer, $3::boolean, $4::boolean)',
              [hostname, accountId, suppress, cabinet],
            );
            await this.queue.publish('', '', hostname, {
              noAck: false,
            });
            goodSites.push({
              numberOfString: lineNr,
              origin: domain,
            });
          }
        } else {
          badSites.push({
            numberOfString: lineNr,
            origin: domain,
          });
        }
      }),
    );
    return {
      existsSites: {
        existSitesList: existSites,
        existSitesCount: existSites.length,
      },
      badSites: {
        badSitesList: badSites,
        badSitesCount: badSites.length,
      },
      goodSites: {
        goodSitesList: goodSites,
        goodSitesCount: goodSites.length,
      },
      type: 'array',
      message: 'OK',
    };
  }

  private parseDomain(value) {
    try {
      return new URL(`http://${String(value).toLowerCase().trim()}`).hostname;
    } catch (e) {
      return '';
    }
  }
}

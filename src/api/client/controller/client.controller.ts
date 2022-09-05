import {
  Body,
  Controller,
  HttpException,
  Inject,
  Post,
  Query,
  Response,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {FilesInterceptor} from '@nestjs/platform-express';
import {ClientService} from '../service/client.service';
import {ExtensionService} from '../../extension/service/extension.service';
import {BodyDto} from '../../dto/body.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as es from 'event-stream';
import {PoolClient} from 'pg';

@Controller('client')
export class ClientController {
  constructor(
    @Inject(ClientService)
    private readonly clientService: ClientService,
    @Inject(ExtensionService)
    private readonly extensionService: ExtensionService,
    @Inject('PG_CONNECTION')
    private readonly pg: PoolClient,
  ) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(@UploadedFiles() files, @Response() res, @Body() body: BodyDto, @Query() query) {
    const accountId = res.locals.account;
    if (!accountId) {
      throw new HttpException('Bad Request / Invalid Token', 400);
    }

    if (!files && !body.domains) {
      throw new HttpException('Bad Request / Empty Body', 400);
    }

    if (files) {
      if (!files.length) {
        return {message: `File is empty`};
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
                  [hostname, accountId, query.suppress, query.cabinet],
                );
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
          return res.json({
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
    }
    if (body.domains) {
      const existSites = [];
      const badSites = [];
      const goodSites = [];
      let lineNr = 0;
      const result = body.domains.map(async (domain) => {
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
              [hostname, accountId, query.suppress, query.cabinet],
            );
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
      });
      Promise.all(result).then(() => {
        if (!result) throw new HttpException('Server Error', 500);
        return res.json({
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
        });
      });
    }
  }

  private parseDomain(value) {
    try {
      return new URL(`https://${String(value).toLowerCase().trim()}`).hostname;
    } catch (e) {
      return '';
    }
  }
}

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
import * as es from 'event-stream';
import * as path from 'path';

@Controller('client')
export class ClientController {
  constructor(
    @Inject(ClientService)
    private readonly clientService: ClientService,
    @Inject(ExtensionService)
    private readonly extensionService: ExtensionService,
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
        return res.json({message: `File is empty`});
      }
      const existSites = [];
      const badSites = [];
      const goodSites = [];
      let lineNr = 0;
      const s = fs
        .createReadStream(path.join(__dirname, '../../../..', 'uploads', `${files[0].filename}`))
        .pipe(es.split())
        .pipe(
          es.mapSync(async (domain) => {
            s.pause();
            lineNr += 1;
            // console.log(domain);
            const origin = this.parseDomain(domain);
            if (origin.match(/^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/)) {
              // console.log(`line: ${lineNr}, data: ${data}, time: ${new Date().toLocaleString('ru-RU')}`);
              const site = await this.extensionService.getSite(origin);
              if (site.rows[0] && site.rows[0].fqdn === new URL(origin).hostname) {
                existSites.push({
                  numberOfString: lineNr,
                  origin: domain,
                });
              } else {
                // console.log(`line: ${lineNr}, data: ${data}, time: ${new Date().toLocaleString('ru-RU')}`);
                await this.extensionService.createSite(origin, accountId, query.suppress, query.cabinet);
                goodSites.push({
                  numberOfString: lineNr,
                  origin: domain,
                });
              }
              s.resume();
            } else {
              // console.log(`line: ${lineNr}, data: ${domain}, time: ${new Date().toLocaleString('ru-RU')}`);
              badSites.push({
                numberOfString: lineNr,
                origin: domain,
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
        const origin = this.parseDomain(domain);
        if (origin.match(/^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/)) {
          const site = await this.extensionService.getSite(origin);

          if (site.rows[0] && site.rows[0].fqdn === new URL(origin).hostname) {
            // console.log(`line: ${lineNr}, data: ${domain}, time: ${new Date().toLocaleString('ru-RU')}`);
            existSites.push({
              numberOfString: lineNr,
              origin: domain,
            });
          } else {
            await this.extensionService.createSite(origin, accountId, query.suppress, query.cabinet);
            // console.log(`line: ${lineNr}, data: ${domain}, time: ${new Date().toLocaleString('ru-RU')}`);
            goodSites.push({
              numberOfString: lineNr,
              origin: domain,
            });
          }
        } else {
          // console.log(`line: ${lineNr}, data: ${domain}, time: ${new Date().toLocaleString('ru-RU')}`);
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
      if (value.startsWith('http://') || value.startsWith('https://')) {
        return new URL(String(value).toLowerCase().trim()).origin;
      } else {
        return new URL(`http://${String(value).toLowerCase().trim()}`).origin;
      }
    } catch (e) {
      return '';
    }
  }
}

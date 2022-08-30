import {Body, Controller, HttpException, Inject, Post, Response, UploadedFiles, UseInterceptors} from '@nestjs/common';
import {ApiConsumes} from '@nestjs/swagger';
import {FilesInterceptor} from '@nestjs/platform-express';
import {ClientService} from '../service/client.service';
import * as fs from 'fs';
import * as csv from 'fast-csv';
import * as path from 'path';
import {ExtensionService} from '../../extension/service/extension.service';
import {BodyDto} from '../../dto/body.dto';

@Controller('client')
export class ClientController {
  constructor(
    @Inject(ClientService)
    private readonly clientService: ClientService,
    @Inject(ExtensionService)
    private readonly extensionService: ExtensionService,
  ) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('file'))
  async uploadFiles(@UploadedFiles() files, @Response() res, @Body() body: BodyDto) {
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
      await fs
        .createReadStream(path.resolve(__dirname, '../../../..', 'uploads', `${files[0].filename}`))
        .pipe(csv.parse())
        .on('error', (e) => {
          return res.json({message: `Something gone wrong: ${e.message}`});
        })
        .on('data', async (data) => {
          if (
            !data[0].match(/^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/) ||
            data[0].length > 253
          ) {
            throw new HttpException('Bad Request', 400);
          }
          const site = await this.extensionService.getSite(data[0]);
          if (site.rows[0].fqdn === new URL(data[0]).hostname) {
            existSites.push(new URL(data[0]).hostname);
          } else {
            await this.extensionService.createSite(data[0], accountId);
          }
        })
        .on('end', async (rowCount: number) => {
          await fs.rmSync(path.resolve(__dirname, '../../../..', 'uploads', `${files[0].filename}`));
          console.log(`Parsed ${rowCount} rows`);
        });

      console.log('existSites', existSites);
      return res.json({
        existSites,
        message: 'OK',
      });
    } else if (body.domains) {
      const existSites = [];
      const result = body.domains.map(async (domain) => {
        if (
          !domain.match(/^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/) ||
          domain.length > 253
        ) {
          throw new HttpException('Bad Request', 400);
        }
        const site = await this.extensionService.getSite(domain);
        if (site.rows[0].fqdn) {
          existSites.push(new URL(domain).hostname);
        } else {
          await this.extensionService.createSite(domain, accountId);
        }
      });
      if (!result) throw new HttpException('Server Error', 500);
      return res.json({existSites, message: 'OK'});
    }
  }
}

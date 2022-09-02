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
import * as csv from 'fast-csv';
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
      const pathS = path.join(__dirname, '../../../..', 'uploads', `${files[0].filename}`);
      console.log(pathS);
      fs.createReadStream(pathS)
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
          if (site.rows[0] && site.rows[0].fqdn === new URL(data[0]).hostname) {
            existSites.push(new URL(data[0]).hostname);
          } else {
            await this.extensionService.createSite(data[0], accountId, query.suppress, query.cabinet);
          }
        })
        .end(async (existSites) => {
          await fs.rmSync(path.resolve(__dirname, '../../../..', 'uploads', `${files[0].filename}`));
          console.log(existSites);
          return res.json({
            existsSites: existSites,
            type: 'file',
            message: `OK, parsed`,
          });
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
        if (!site.rows.length) {
          await this.extensionService.createSite(domain, accountId, query.suppress, query.cabinet);
        } else {
          existSites.push(new URL(domain).hostname);
        }
      });
      Promise.all(result).then(() => {
        if (!result) throw new HttpException('Server Error', 500);
        return res.json({
          existSites,
          type: 'array',
          message: 'OK',
        });
      });
    }
  }
}

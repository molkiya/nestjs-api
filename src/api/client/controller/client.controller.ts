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
    const email = res.locals.email;
    if (!email) {
      throw new HttpException('Bad Request / Invalid Token', 400);
    }
    if (files) {
      await fs
        .createReadStream(path.resolve(__dirname, '../../../..', 'uploads', `${files[0].filename}`))
        .pipe(csv.parse())
        .on('error', (error) => console.error(error))
        .on('data', async (data) => {
          if (
            !data[0].match(/^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/) ||
            data[0].length > 253
          ) {
            throw new HttpException('Bad Request', 400);
          }

          await this.extensionService.createSite(data[0], email);
        })
        .on('end', (rowCount: number) => {
          fs.rmSync(path.resolve(__dirname, '../../../..', 'uploads', `${files[0].filename}`));
          console.log(`Parsed ${rowCount} rows`);
        });
    } else {
      const result = body.domains.map(async (domain) => {
        if (
          !domain.match(/^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/) ||
          domain.length > 253
        ) {
          throw new HttpException('Bad Request', 400);
        }
        await this.extensionService.createSite(domain, email);
      });
      if (!result) throw new HttpException('Server Error', 500);
      return res.json({message: 'OK'});
    }
  }
}

import {Body, Controller, HttpException, Inject, Post, UploadedFiles, UseInterceptors} from '@nestjs/common';
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
  async uploadFiles(@UploadedFiles() file, @Body() body: BodyDto) {
    if (file) {
      fs.createReadStream(path.resolve(__dirname, '../../../..', 'uploads', `${file[0].filename}`))
        .pipe(csv.parse())
        .on('error', (error) => console.error(error))
        .on('data', (data) => {
          console.log(data[0]);
          if (
            !data[0].match(/^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/) ||
            data[0].length > 253
          ) {
            throw new HttpException('Bad Request', 400);
          }
          this.extensionService.createSite(data[0], body.email);
        })
        .on('end', (rowCount: number) => {
          fs.rmSync(path.resolve(__dirname, '../../../..', 'uploads', `${file[0].filename}`));
          console.log(`Parsed ${rowCount} rows`);
        });
    } else {
      body.domains.map((domain) => {
        if (
          !domain.match(/^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/) ||
          domain.length > 253
        ) {
          throw new HttpException('Bad Request', 400);
        }
        this.extensionService.createSite(domain, body.email);
      });
    }
  }
}

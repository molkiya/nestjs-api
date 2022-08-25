import {Controller, Inject, Post, UploadedFiles, UseInterceptors} from '@nestjs/common';
import {ApiConsumes} from '@nestjs/swagger';
import {FilesInterceptor} from '@nestjs/platform-express';
import {ClientService} from '../service/client.service';
import * as fs from 'fs';

@Controller('client')
export class ClientController {
  constructor(
    @Inject(ClientService)
    private readonly clientService: ClientService,
  ) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('file'))
  async uploadFiles(@UploadedFiles() file) {
    function delay(time) {
      return new Promise((resolve) => setTimeout(resolve, time));
    }

    await delay(3000);

    const stream = fs.createReadStream(`../uploads/${file[0].filename}`);
    return await this.clientService.uploadData(file, stream);
  }
}

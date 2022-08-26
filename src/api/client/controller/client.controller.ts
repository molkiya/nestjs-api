import {Controller, Inject, Post, UploadedFiles, UseInterceptors} from '@nestjs/common';
import {ApiConsumes} from '@nestjs/swagger';
import {FilesInterceptor} from '@nestjs/platform-express';
import {ClientService} from '../service/client.service';
import * as fs from 'fs';
import path from 'path';

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
    console.log(file[0].filename);
    const stream = fs.createReadStream(`${path.join(__dirname, `../uploads/${file[0].filename}`)}`);
    return await this.clientService.uploadData(file, file[0].filename);
  }
}

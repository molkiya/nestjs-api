import {Controller, Post, UploadedFiles, UseInterceptors} from '@nestjs/common';
import {ApiConsumes, ApiTags} from '@nestjs/swagger';
import {FilesInterceptor} from '@nestjs/platform-express';
import {UploadFileService} from '../service/upload.service';

@Controller('client')
@ApiTags('Client')
export class ClientController {
  constructor(private uploadFileService: UploadFileService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('file'))
  async uploadFiles(@UploadedFiles() file) {
    return await this.uploadFileService.uploadData(file);
  }
}

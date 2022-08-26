import {Injectable} from '@nestjs/common';
import {MulterModuleOptions, MulterOptionsFactory} from '@nestjs/platform-express';
import {diskStorage} from 'multer';
import {fileFilter, filename} from '../api/utils/fileUpload.utils';

@Injectable()
export class MulterConfig implements MulterOptionsFactory {
  createMulterOptions(): MulterModuleOptions {
    return {
      storage: diskStorage({
        destination: './uploads',
        filename: filename,
      }),
      fileFilter: fileFilter,
    };
  }
}

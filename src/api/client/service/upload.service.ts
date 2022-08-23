import {Injectable} from '@nestjs/common';

@Injectable()
export class UploadFileService {
  constructor() {}

  public async uploadData(file) {
    console.log(file);
  }
}

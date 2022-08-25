import {Injectable} from '@nestjs/common';

@Injectable()
export class ClientService {
  constructor() {}

  public async uploadData(data) {
    console.log('data', data);
  }
}

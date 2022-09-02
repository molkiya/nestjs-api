import {Injectable} from '@nestjs/common';

@Injectable()
export class RegService {
  constructor() {}

  public loginService(): object {
    return {
      message: 'OK',
    };
  }
}

import {Inject} from '@nestjs/common';
import Redis from 'ioredis';

export class ClientService {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  public async uploadData(data, stream) {
    console.log(stream);
  }
}

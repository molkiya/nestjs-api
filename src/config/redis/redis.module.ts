import {Module} from '@nestjs/common';
import {createClient} from '@redis/client';
import {REDIS_HOST, REDIS_PASSWORD, REDIS_PORT} from '../app/app.config';

@Module({
  providers: [
    {
      provide: 'REDIS_OPTIONS',
      useValue: {
        url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
        password: REDIS_PASSWORD,
      },
    },
    {
      inject: ['REDIS_OPTIONS'],
      provide: 'REDIS_CLIENT',
      useFactory: async (options: {url: string; password: string}) => {
        const client = createClient(options);
        await client.connect();
        return client;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}

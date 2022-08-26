import {MiddlewareConsumer, Module, RequestMethod} from '@nestjs/common';

import {CheckOauthMiddleware} from './extension/middleware/checkOauth.middleware';
import {ClientModule} from './client/client.module';
import {ExtensionModule} from './extension/extension.module';
import {RedisModule} from '../config/redis/redis.module';
import {PostgreSQLModule} from '../config/database/postgresql.config';

@Module({
  imports: [ClientModule, ExtensionModule, RedisModule, PostgreSQLModule],
  controllers: [],
  providers: [],
})
export class ApiModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CheckOauthMiddleware)
      .forRoutes({path: 'ext', method: RequestMethod.ALL}, {path: 'ext/assign', method: RequestMethod.ALL});
  }
}

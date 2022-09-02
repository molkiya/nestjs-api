import {MiddlewareConsumer, Module, RequestMethod} from '@nestjs/common';
import {RegService} from './service/reg.service';
import {RegController} from './controller/reg.controller';
import {CheckOauthMiddleware} from '../middleware/checkOauth.middleware';
import {RedisModule} from '../../config/redis/redis.module';
import {PostgreSQLModule} from '../../config/database/postgresql.config';

@Module({
  imports: [RedisModule, PostgreSQLModule],
  controllers: [RegController],
  providers: [RegService],
})
export class RegModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CheckOauthMiddleware).forRoutes({
      path: 'reg/log',
      method: RequestMethod.POST,
    });
  }
}

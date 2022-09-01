import {MiddlewareConsumer, Module, RequestMethod} from '@nestjs/common';
import {ExtensionController} from './controller/extension.controller';
import {ExtensionService} from './service/extension.service';
import {RedisModule} from '../../config/redis/redis.module';
import {CheckOauthMiddleware} from '../middleware/checkOauth.middleware';
import {MongoDBModule} from '../../config/database/mongodb.config';
import {PostgreSQLModule} from '../../config/database/postgresql.config';

@Module({
  imports: [RedisModule, MongoDBModule, PostgreSQLModule],
  controllers: [ExtensionController],
  providers: [ExtensionService],
  exports: [ExtensionService],
})
export class ExtensionModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CheckOauthMiddleware).forRoutes(
      {path: 'ext', method: RequestMethod.GET},
      {
        path: 'ext/assign',
        method: RequestMethod.POST,
      },
    );
  }
}

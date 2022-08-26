import {MiddlewareConsumer, Module, RequestMethod} from '@nestjs/common';
import {ExtensionService} from './service/extension.service';
import {ExtensionController} from './controller/extension.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import Entities from './entities/entities';

import {CheckOauthMiddleware} from './middleware/checkOauth.middleware';
import {RedisModule} from '../../config/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature(Entities), RedisModule],
  controllers: [ExtensionController],
  providers: [ExtensionService],
})
export class ExtensionModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CheckOauthMiddleware).forRoutes({path: 'ext', method: RequestMethod.ALL});
  }
}

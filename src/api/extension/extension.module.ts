import {MiddlewareConsumer, Module, RequestMethod} from '@nestjs/common';
import {ExtensionController} from './controller/extension.controller';
import {ExtensionService} from './service/extension.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import Entities from '../entities/entities';
import {RedisModule} from '../../config/redis/redis.module';
import {CheckOauthMiddlewareExtension} from './middleware/checkOauth.middleware';
import {MongoDBModule} from '../../config/database/mongodb.config';

@Module({
  imports: [TypeOrmModule.forFeature(Entities), RedisModule, MongoDBModule],
  controllers: [ExtensionController],
  providers: [ExtensionService],
  exports: [ExtensionService],
})
export class ExtensionModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CheckOauthMiddlewareExtension)
      .forRoutes({path: 'ext', method: RequestMethod.GET}, {path: 'ext/assign', method: RequestMethod.POST});
  }
}

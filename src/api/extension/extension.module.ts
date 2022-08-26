import {MiddlewareConsumer, Module, RequestMethod} from '@nestjs/common';
import {ExtensionController} from './controller/extension.controller';
import {ExtensionService} from './service/extension.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import Entities from '../entities/entities';
import {RedisModule} from '../../config/redis/redis.module';
import {PostgreSQLModule} from '../../config/database/postgresql.config';
import {CheckOauthMiddlewareExtension} from './middleware/checkOauth.middleware';

@Module({
  imports: [TypeOrmModule.forFeature(Entities), RedisModule, PostgreSQLModule],
  providers: [ExtensionService],
  controllers: [ExtensionController],
  exports: [ExtensionService],
})
export class ExtensionModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CheckOauthMiddlewareExtension)
      .forRoutes({path: 'ext', method: RequestMethod.GET}, {path: 'ext/assign', method: RequestMethod.POST});
  }
}

import {MiddlewareConsumer, Module, RequestMethod} from '@nestjs/common';
import {ExtensionService} from './service/extension.service';
import {ExtensionController} from './controller/extension.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import Entities from './entities/entities';

import {CheckOauthMiddleware} from './middleware/checkOauth.middleware';
import {RedisModule} from '../../config/redis/redis.module';
import {MongooseModule} from '@nestjs/mongoose';
import {CachedSite, CachedSiteSchema} from '../schemas/site.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature(Entities),
    RedisModule,
    MongooseModule.forFeature([
      {
        name: CachedSite.name,
        schema: CachedSiteSchema,
      },
    ]),
  ],
  controllers: [ExtensionController],
  providers: [ExtensionService],
})
export class ExtensionModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CheckOauthMiddleware).forRoutes({path: 'api/ext/*', method: RequestMethod.ALL});
  }
}

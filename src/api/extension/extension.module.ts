import {MiddlewareConsumer, Module, RequestMethod} from '@nestjs/common';
import {ExtensionController} from './controller/extension.controller';
import {ExtensionService} from './service/extension.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import Entities from '../entities/entities';
import {RedisModule} from '../../config/redis/redis.module';
import {MongooseModule} from '@nestjs/mongoose';
import {CachedSite, CachedSiteSchema} from '../schemas/site.schema';
import {CheckOauthMiddlewareExtension} from './middleware/checkOauth.middleware';

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
    consumer
      .apply(CheckOauthMiddlewareExtension)
      .forRoutes({path: 'ext', method: RequestMethod.GET}, {path: 'ext/assign', method: RequestMethod.POST});
  }
}

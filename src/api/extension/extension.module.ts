import {MiddlewareConsumer, Module, RequestMethod} from '@nestjs/common';
import {ExtensionController} from './controller/extension.controller';
import {ExtensionService} from './service/extension.service';
import {RedisModule} from '../../config/redis/redis.module';
import {MongooseModule} from '@nestjs/mongoose';
import {CachedSite, CachedSiteSchema} from '../schemas/site.schema';
import {CheckOauthMiddlewareExtension} from './middleware/checkOauth.middleware';
import {PostgreSQLModule} from '../../config/database/postgresql.config';

@Module({
  imports: [
    RedisModule,
    MongooseModule.forFeature([
      {
        name: CachedSite.name,
        schema: CachedSiteSchema,
      },
    ]),
    PostgreSQLModule,
  ],
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

import {MiddlewareConsumer, Module, RequestMethod} from '@nestjs/common';
import {ClientService} from './service/client.service';
import {ClientController} from './controller/client.controller';
import {MulterModule} from '@nestjs/platform-express';
import {MulterConfig} from '../../config/multer.config';
import {PostgreSQLModule} from '../../config/database/postgresql.config';
import {TypeOrmModule} from '@nestjs/typeorm';
import Entities from '../entities/entities';
import {RedisModule} from '../../config/redis/redis.module';
import {ExtensionModule} from '../extension/extension.module';
import {CheckOauthMiddlewareClient} from './middleware/checkToken.middleware';
import {MongoDBModule} from '../../config/database/mongodb.config';
import {MongooseModule} from '@nestjs/mongoose';
import {CachedSite, CachedSiteSchema} from '../schemas/site.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature(Entities),
    MulterModule.registerAsync({
      useClass: MulterConfig,
    }),
    PostgreSQLModule,
    RedisModule,
    ExtensionModule,
    MongoDBModule,
    MongooseModule.forFeature([
      {
        name: CachedSite.name,
        schema: CachedSiteSchema,
      },
    ]),
  ],
  providers: [ClientService],
  controllers: [ClientController],
  exports: [ClientService],
})
export class ClientModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CheckOauthMiddlewareClient).forRoutes({path: '/client/upload', method: RequestMethod.POST});
  }
}

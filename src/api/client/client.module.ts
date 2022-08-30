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

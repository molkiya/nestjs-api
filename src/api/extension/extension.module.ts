import {Module} from '@nestjs/common';
import {ExtensionController} from './controller/extension.controller';
import {ExtensionService} from './service/extension.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import Entities from '../entities/entities';
import {RedisModule} from '../../config/redis/redis.module';
import {PostgreSQLModule} from '../../config/database/postgresql.config';
import {MongooseModule} from '@nestjs/mongoose';
import {MONGODB_HOST, MONGODB_PASSWORD, MONGODB_PORT, MONGODB_USERNAME} from '../../config/app/app.config';
import {ClientModule} from '../client/client.module';

@Module({
  imports: [
    ClientModule,
    TypeOrmModule.forFeature(Entities),
    MongooseModule.forRoot(`mongodb://${MONGODB_HOST}:${MONGODB_PORT}`, {
      user: MONGODB_USERNAME,
      pass: MONGODB_PASSWORD,
      dbName: 'tom',
    }),
    RedisModule,
    PostgreSQLModule,
  ],
  providers: [ExtensionService],
  controllers: [ExtensionController],
})
export class ExtensionModule {}

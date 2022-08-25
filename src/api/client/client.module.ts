import {Module} from '@nestjs/common';
import {ClientService} from './service/client.service';
import {ClientController} from './controller/client.controller';
import {MulterModule} from '@nestjs/platform-express';
import {MulterConfig} from '../../config/multer.config';
import {PostgreSQLModule} from '../../config/database/postgresql.config';
import {MongooseModule} from '@nestjs/mongoose';
import {MONGODB_HOST, MONGODB_PASSWORD, MONGODB_PORT, MONGODB_USERNAME} from '../../config/app/app.config';
import {TypeOrmModule} from '@nestjs/typeorm';
import Entities from '../entities/entities';
import {RedisModule} from '../../config/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature(Entities),
    MongooseModule.forRoot(`mongodb://${MONGODB_HOST}:${MONGODB_PORT}`, {
      user: MONGODB_USERNAME,
      pass: MONGODB_PASSWORD,
      dbName: 'tom',
    }),
    MulterModule.registerAsync({
      useClass: MulterConfig,
    }),
    PostgreSQLModule,
    RedisModule,
  ],
  providers: [ClientService],
  controllers: [ClientController],
  exports: [ClientService],
})
export class ClientModule {}

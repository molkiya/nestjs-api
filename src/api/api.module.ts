import {Module} from '@nestjs/common';
import {ExtensionModule} from './extension/extension.module';
import {RedisModule} from '../config/redis/redis.module';
import {PostgreSQLModule} from '../config/database/postgresql.config';
import {MongoDBModule} from '../config/database/mongodb.config';
import {ClientModule} from './client/client.module';
import {RegModule} from './reg/reg.module';

@Module({
  imports: [ExtensionModule, RedisModule, PostgreSQLModule, MongoDBModule, ClientModule, RegModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class ApiModule {}

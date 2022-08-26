import {Module} from '@nestjs/common';
import {ClientModule} from './client/client.module';
import {ExtensionModule} from './extension/extension.module';
import {RedisModule} from '../config/redis/redis.module';
import {PostgreSQLModule} from '../config/database/postgresql.config';

@Module({
  imports: [ClientModule, ExtensionModule, RedisModule, PostgreSQLModule],
  controllers: [],
  providers: [],
})
export class ApiModule {}

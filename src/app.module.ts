import {Module} from '@nestjs/common';
import {ExtensionModule} from './api/extension/extension.module';
import {ClientModule} from './api/client/client.module';
import {PostgreSQLModule} from './config/database/postgresql.config';
import {MongoDBModule} from './config/database/mongdb.config';

@Module({
  imports: [ExtensionModule, ClientModule, PostgreSQLModule, MongoDBModule],
})
export class AppModule {}

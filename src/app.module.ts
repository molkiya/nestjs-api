import {Module} from '@nestjs/common';
import {ExtensionModule} from './api/extension/extension.module';
import {PostgreSQLModule} from './config/database/postgresql.config';
import {ClientModule} from './api/client/client.module';

@Module({
  imports: [PostgreSQLModule, ExtensionModule, ClientModule],
})
export class AppModule {}

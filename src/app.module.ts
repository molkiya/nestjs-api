import {Module} from '@nestjs/common';
import {ExtensionModule} from './api/extension/extension.module';
import {PostgreSQLModule} from './config/database/postgresql.config';

@Module({
  imports: [PostgreSQLModule, ExtensionModule],
})
export class AppModule {}

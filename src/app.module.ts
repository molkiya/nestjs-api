import { Module } from '@nestjs/common';
import { ExtensionModule } from './api/extension/extension.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  DB_DEV,
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_USERNAME,
} from './app.environments';
import { SitesEntity } from './api/extension/entities/sites.entity';
import { WhoisEntity } from './api/extension/entities/whois.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: DB_HOST,
      port: DB_PORT,
      username: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_NAME,
      entities: [SitesEntity, WhoisEntity],
      synchronize: DB_DEV,
      logging: DB_DEV,
      retryDelay: 5000,
    }),
    ExtensionModule,
  ],
})
export class AppModule {}

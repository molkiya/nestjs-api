import { Module } from '@nestjs/common';
import { ExtensionModule } from './api/extenshion/extension.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_USERNAME,
} from './app.environments';
import { SitesEntity } from './api/extenshion/entities/sites.entity';
import { WhoisEntity } from './api/extenshion/entities/whois.entity';

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
      synchronize: true,
      logging: true,
      retryDelay: 5000,
    }),
    ExtensionModule,
  ],
})
export class AppModule {}

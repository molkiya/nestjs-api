import { Module } from '@nestjs/common';
import { HostsModule } from './api/hosts/hosts.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_USERNAME,
} from './app.environments';
import { Host } from './api/hosts/entities/host.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: DB_HOST,
      port: DB_PORT,
      username: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_NAME,
      entities: [Host],
      synchronize: true,
      retryDelay: 5000,
    }),
    HostsModule,
  ],
})
export class AppModule {}

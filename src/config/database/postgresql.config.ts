import {TypeOrmModule} from '@nestjs/typeorm';
import {
  DB_DEV,
  POSTGRESQL_DB_HOST,
  POSTGRESQL_DB_NAME,
  POSTGRESQL_DB_PASSWORD,
  POSTGRESQL_DB_PORT,
  POSTGRESQL_DB_USERNAME,
} from '../app/app.config';
import Entities from '../../api/extension/entities/entities';
import {Module} from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: POSTGRESQL_DB_HOST,
      port: POSTGRESQL_DB_PORT,
      username: POSTGRESQL_DB_USERNAME,
      password: POSTGRESQL_DB_PASSWORD,
      database: POSTGRESQL_DB_NAME,
      entities: Entities,
      synchronize: DB_DEV,
      logging: DB_DEV,
      retryDelay: 5000,
    }),
  ],
})
export class PostgreSQLModule {}

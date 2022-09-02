import {
  POSTGRESQL_DB_HOST,
  POSTGRESQL_DB_NAME,
  POSTGRESQL_DB_PASSWORD,
  POSTGRESQL_DB_PORT,
  POSTGRESQL_DB_USERNAME,
} from '../app/app.config';
import {Pool} from 'pg';
import {Module} from '@nestjs/common';

@Module({
  providers: [
    {
      provide: 'PG_CONNECTION',
      useValue: new Pool({
        user: POSTGRESQL_DB_USERNAME,
        host: POSTGRESQL_DB_HOST,
        database: POSTGRESQL_DB_NAME,
        password: POSTGRESQL_DB_PASSWORD,
        port: POSTGRESQL_DB_PORT,
      }),
    },
  ],
  exports: ['PG_CONNECTION'],
})
export class PostgreSQLModule {}

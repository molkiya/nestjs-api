import {TypeOrmModule} from '@nestjs/typeorm';
import {DB_DEV, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USERNAME} from '../app/app.config';
import Entities from '../../api/extension/entities/entities';
import {Module} from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: DB_HOST,
      port: DB_PORT,
      username: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_NAME,
      entities: Entities,
      synchronize: DB_DEV,
      logging: DB_DEV,
      retryDelay: 5000,
    }),
  ],
})
export class PostgreSQLModule {}
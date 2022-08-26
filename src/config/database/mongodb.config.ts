import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {MONGODB_DATABASE, MONGODB_HOST, MONGODB_PASSWORD, MONGODB_PORT, MONGODB_USERNAME} from '../app/app.config';

@Module({
  imports: [
    MongooseModule.forRoot(`mongodb://${MONGODB_HOST}:${MONGODB_PORT}`, {
      dbName: MONGODB_DATABASE,
      user: MONGODB_USERNAME,
      pass: MONGODB_PASSWORD,
    }),
  ],
})
export class MongoDBModule {}

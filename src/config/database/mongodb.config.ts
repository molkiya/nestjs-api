import {Module} from '@nestjs/common';
import {Db, MongoClient} from 'mongodb';
import {MONGODB_DATABASE, MONGODB_HOST, MONGODB_PASSWORD, MONGODB_PORT, MONGODB_USERNAME} from '../app/app.config';

@Module({
  providers: [
    {
      provide: 'MONGODB_CONNECTION',
      useFactory: async (): Promise<Db> => {
        try {
          const client = await MongoClient.connect(
            `mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}`,
          );
          const db = client.db(`${MONGODB_DATABASE}`);
          if (!db.collection(`${MONGODB_DATABASE}`)) {
            await db.createCollection('sites', {capped: true, size: 5242880});
          }
          return db;
        } catch (e) {
          throw e;
        }
      },
    },
  ],
  exports: ['MONGODB_CONNECTION'],
})
export class MongoDBModule {}

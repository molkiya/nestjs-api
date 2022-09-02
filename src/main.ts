import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {initOauth} from './api/utils/oauthClient.utils';
import {APP_PORT, DEV} from './config/app/app.config';
import * as bodyParser from 'body-parser';
import {pgInit} from './api/utils/pgInit.utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors();
  app.use(bodyParser.json({limit: '1mb'}));
  app.use(bodyParser.urlencoded({limit: '1mb', extended: true}));

  initOauth();

  if (DEV) await pgInit();

  await app.listen(APP_PORT, () => {
    console.log('Server starting at:', APP_PORT);
  });
}

bootstrap();

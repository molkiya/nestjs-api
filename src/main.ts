import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {initOauth} from './api/utils/oauthClient.utils';
import {APP_PORT, DEV} from './config/app/app.config';
import {DocumentBuilder, OpenAPIObject, SwaggerModule} from '@nestjs/swagger';
import * as bodyParser from 'body-parser';
import {pgInit} from './config/database/postgresql.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const options = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('TOMCAT')
    .setDescription('Tom cat api documentation')
    .setVersion('1.0')
    .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  app.enableCors();
  app.use(bodyParser.json({limit: '1mb'}));
  app.use(bodyParser.urlencoded({limit: '1mb', extended: true}));

  initOauth();

  if (DEV) {
    await pgInit();
  }

  await app.listen(APP_PORT, () => {
    console.log('Server starting at:', APP_PORT);
  });
}

bootstrap();

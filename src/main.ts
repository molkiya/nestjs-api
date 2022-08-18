import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {initOauth} from './api/utils/oauthClient.utils';
import {APP_PORT} from './config/app/app.config';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const PORT: number = APP_PORT;
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const options = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('TOMCAT')
    .setDescription('Tom cat api documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  app.enableCors();
  app.use(bodyParser.json({limit: '1mb'}));
  app.use(bodyParser.urlencoded({limit: '1mb', extended: true}));
  initOauth();

  await app.listen(PORT, () => {
    console.log('Server starting at:', PORT);
  });
}

bootstrap();

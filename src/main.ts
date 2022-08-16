import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {initOauth} from './api/utils/oauthClient';

async function bootstrap() {
  initOauth();
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();

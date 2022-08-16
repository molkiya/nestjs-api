import {MiddlewareConsumer, Module, RequestMethod} from '@nestjs/common';
import {ExtensionService} from './service/extension.service';
import {ExtensionController} from './controller/extension.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import Entities from './entities/entities';

import {CheckOauthMiddleware} from './middlewares/checkOauth.middleware';

@Module({
  imports: [TypeOrmModule.forFeature(Entities)],
  controllers: [ExtensionController],
  providers: [ExtensionService],
})
export class ExtensionModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CheckOauthMiddleware).forRoutes({path: '*', method: RequestMethod.ALL});
  }
}

import {Module} from '@nestjs/common';
import {ExtensionService} from './service/extension.service';
import {ExtensionController} from './controller/extension.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import Entities from './entities/entities';
@Module({
  imports: [TypeOrmModule.forFeature(Entities)],
  controllers: [ExtensionController],
  providers: [ExtensionService],
})
export class ExtensionModule {}

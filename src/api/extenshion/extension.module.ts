import { Module } from '@nestjs/common';
import { ExtensionService } from './service/extension.service';
import { ExtensionController } from './controller/extension.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SitesEntity } from './entities/sites.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SitesEntity])],
  controllers: [ExtensionController],
  providers: [ExtensionService],
})
export class ExtensionModule {}

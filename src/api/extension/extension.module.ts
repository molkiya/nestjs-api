import { Module } from '@nestjs/common';
import { ExtensionService } from './service/extension.service';
import { ExtensionController } from './controller/extension.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SitesEntity } from './entities/sites.entity';
import { WhoisEntity } from './entities/whois.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SitesEntity, WhoisEntity])],
  controllers: [ExtensionController],
  providers: [ExtensionService],
})
export class ExtensionModule {}

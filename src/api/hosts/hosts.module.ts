import { Module } from '@nestjs/common';
import { HostsService } from './hosts.service';
import { HostsController } from './hosts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Host } from './entities/host.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Host])],
  controllers: [HostsController],
  providers: [HostsService],
})
export class HostsModule {}

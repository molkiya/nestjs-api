import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { HostsService } from './hosts.service';
import { CreateHostDto } from './dto/create-host.dto';
import { UpdateHostDto } from './dto/update-host.dto';

@Controller('hosts')
export class HostsController {
  constructor(private readonly hostsService: HostsService) {}

  @Post()
  create(@Body() createHostDto: CreateHostDto) {
    return this.hostsService.create(createHostDto);
  }

  @Get()
  findAll() {
    return this.hostsService.findAll();
  }

  @Get(':id')
  findOne(@Param('url') url: string) {
    return this.hostsService.findOne(url);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHostDto: UpdateHostDto) {
    return this.hostsService.update(+id, updateHostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hostsService.remove(+id);
  }
}

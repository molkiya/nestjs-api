import { Injectable } from '@nestjs/common';
import { CreateHostDto } from './dto/create-host.dto';
import { UpdateHostDto } from './dto/update-host.dto';
import { Host } from './entities/host.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class HostsService {
  constructor(
    @InjectRepository(Host)
    private hostsRepository: Repository<Host>,
  ) {}

  create(createHostDto: CreateHostDto) {
    return `Hello World`;
  }

  findAll() {
    return `This action returns all hosts`;
  }

  findOne(url: string): Promise<Host> {
    return this.hostsRepository.findOneBy({ url });
  }

  update(id: number, updateHostDto: UpdateHostDto) {
    return `This action updates a #${id} host`;
  }

  remove(id: number) {
    return `This action removes a #${id} host`;
  }
}

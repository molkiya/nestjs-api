import { Test, TestingModule } from '@nestjs/testing';
import { HostsService } from './hosts.service';

describe('HostsService', () => {
  let service: HostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HostsService],
    }).compile();

    service = module.get<HostsService>(HostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

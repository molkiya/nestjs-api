import { Test, TestingModule } from '@nestjs/testing';
import { HostsController } from './hosts.controller';
import { HostsService } from './hosts.service';

describe('HostsController', () => {
  let controller: HostsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HostsController],
      providers: [HostsService],
    }).compile();

    controller = module.get<HostsController>(HostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

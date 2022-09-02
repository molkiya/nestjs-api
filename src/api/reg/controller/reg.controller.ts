import {Controller, Inject, Post} from '@nestjs/common';
import {RegService} from '../service/reg.service';

@Controller('reg')
export class RegController {
  constructor(
    @Inject(RegService)
    private readonly regService: RegService,
  ) {}

  @Post('log')
  async regUser() {
    return this.regService.loginService();
  }
}

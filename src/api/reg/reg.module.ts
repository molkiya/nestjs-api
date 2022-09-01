import {Module} from '@nestjs/common';
import {RegService} from './service/reg.service';
import {RegController} from './controller/reg.controller';

@Module({
  controllers: [RegController],
  providers: [RegService],
})
export class RegModule {}

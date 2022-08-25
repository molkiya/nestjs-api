import {Module} from '@nestjs/common';
import {ClientController} from './controller/client.controller';
import {MulterModule} from '@nestjs/platform-express';
import {MulterConfig} from '../../config/multer.config';
import {ClientService} from './service/upload.service';

@Module({
  imports: [
    MulterModule.registerAsync({
      useClass: MulterConfig,
    }),
  ],
  controllers: [ClientController],
  providers: [ClientService],
})
export class ClientModule {}

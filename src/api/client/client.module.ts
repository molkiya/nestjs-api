import {Module} from '@nestjs/common';
import {UploadFileService} from './service/upload.service';
import {ClientController} from './controller/client.controller';

@Module({
  controllers: [ClientController],
  providers: [UploadFileService],
})
export class ClientModule {}

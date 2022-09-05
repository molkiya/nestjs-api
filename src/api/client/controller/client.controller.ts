import {
  Body,
  Controller,
  HttpException,
  Inject,
  Post,
  Query,
  Response,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {FilesInterceptor} from '@nestjs/platform-express';
import {ClientService} from '../service/client.service';
import {ExtensionService} from '../../extension/service/extension.service';
import {BodyDto} from '../../dto/body.dto';

@Controller('client')
export class ClientController {
  constructor(
    @Inject(ClientService)
    private readonly clientService: ClientService,
    @Inject(ExtensionService)
    private readonly extensionService: ExtensionService,
  ) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(@UploadedFiles() files, @Response() res, @Body() body: BodyDto, @Query() query) {
    const accountId = res.locals.account;
    if (!accountId) {
      throw new HttpException('Bad Request / Invalid Token', 400);
    }

    if (!files && !body.domains) {
      throw new HttpException('Bad Request / Empty Body', 400);
    }

    if (files) {
      const result = await this.clientService.uploadFromFile(
        files,
        res.locals.accountId,
        query.suppress,
        query.cabinet,
      );
      return res.json(result);
    }
    if (body.domains) {
      const result = await this.clientService.uploadFromBody(
        body.domains,
        res.locals.accountId,
        query.suppress,
        query.cabinet,
      );
      return res.json(result);
    }
  }
}

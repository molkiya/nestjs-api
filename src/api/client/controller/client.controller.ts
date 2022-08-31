import {
  Body,
  Controller, Headers,
  HttpException,
  Inject,
  Post,
  Query,
  Response,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {ApiConsumes} from '@nestjs/swagger';
import {FilesInterceptor} from '@nestjs/platform-express';
import {ClientService} from '../service/client.service';
import {ExtensionService} from '../../extension/service/extension.service';
import {BodyDto} from '../../dto/body.dto';
import * as fs from 'fs';
import * as csv from 'fast-csv';
import * as path from 'path';
import {getOauthClient} from "../../utils/oauthClient.utils";
import {DOMAIN_LIST} from "../../utils/email.utils";

@Controller('client')
export class ClientController {
  constructor(
    @Inject(ClientService)
    private readonly clientService: ClientService,
    @Inject(ExtensionService)
    private readonly extensionService: ExtensionService,
  ) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
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
      if (!files.length) {
        return res.json({message: `File is empty`});
      }
      const existSites = [];
      const pathS = path.join(__dirname, '../../../..', 'uploads', `${files[0].filename}`);
      console.log(pathS);
      fs.createReadStream(pathS)
        .pipe(csv.parse())
        .on('error', (e) => {
          return res.json({message: `Something gone wrong: ${e.message}`});
        })
        .on('data', async (data) => {
          if (
            !data[0].match(/^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/) ||
            data[0].length > 253
          ) {
            throw new HttpException('Bad Request', 400);
          }
          const site = await this.extensionService.getSite(data[0]);
          if (site.rows[0] && site.rows[0].fqdn === new URL(data[0]).hostname) {
            existSites.push(new URL(data[0]).hostname);
          } else {
            await this.extensionService.createSite(data[0], accountId, query.suppress, query.cabinet);
          }
        })
        .end(async (existSites) => {
          await fs.rmSync(path.resolve(__dirname, '../../../..', 'uploads', `${files[0].filename}`));
          console.log(existSites);
          return res.json({
            existsSites: existSites,
            type: 'file',
            message: `OK, parsed`,
          });
        });
    } else if (body.domains) {
      const existSites = [];
      const result = body.domains.map(async (domain) => {
        if (
          !domain.match(/^(http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/) ||
          domain.length > 253
        ) {
          throw new HttpException('Bad Request', 400);
        }
        const site = await this.extensionService.getSite(domain);
        if (!site.rows.length) {
          await this.extensionService.createSite(domain, accountId, query.suppress, query.cabinet);
        } else {
          existSites.push(new URL(domain).hostname);
        }
      });
      Promise.all(result).then(() => {
        if (!result) throw new HttpException('Server Error', 500);
        return res.json({
          existSites,
          type: 'array',
          message: 'OK',
        });
      });
    }
  }


  @Post('reg')
  async regUser(@Headers() headers, @Response() res) {

    if (!headers.authorization) {
      throw new HttpException('Unauthorized', 401)
    }
    let oAuthCode = headers.authorization
    let tokens
    let tokenCheck

    try {
      let token = await getOauthClient().getToken(oAuthCode);
      tokens = token.tokens
      tokenCheck = await getOauthClient().getTokenInfo(tokens.access_token)
    } catch (err) {
      throw new HttpException('Unauthorized', 401)
    }

    if (
        tokenCheck.email_verified &&
        DOMAIN_LIST.map((DOMAIN: string) => {
          return tokenCheck.email.endsWith(DOMAIN);
        }).includes(true)
    ) {
      return res
          .json(
              {
                xAccessToken: tokens.access_token,
                xRefreshToken: tokens.refresh_token
              })
    } else {
      throw new HttpException('Unauthorized', 401);
    }
  }
}

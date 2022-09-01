import {Controller, Headers, HttpException, Post, Response} from '@nestjs/common';
import {getOauthClient} from '../../utils/oauthClient.utils';
import {DOMAIN_LIST} from '../../utils/email.utils';

@Controller('reg')
export class RegController {
  constructor() {}

  @Post('log')
  async regUser(@Headers() headers, @Response() res) {
    if (!headers.authorization) {
      throw new HttpException('Unauthorized', 401);
    }

    try {
      const token = await getOauthClient().getToken(headers.authorization);
      const tokens = token.tokens;
      const tokenCheck = await getOauthClient().getTokenInfo(tokens.access_token);

      if (
        tokenCheck.email_verified &&
        DOMAIN_LIST.map((DOMAIN: string) => {
          return tokenCheck.email.endsWith(DOMAIN);
        }).includes(true)
      ) {
        return res.json({
          xAccessToken: tokens.access_token,
          xRefreshToken: tokens.refresh_token,
        });
      }
    } catch (err) {
      throw new HttpException('Unauthorized', 401);
    }
  }
}

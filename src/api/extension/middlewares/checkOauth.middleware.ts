import {HttpException, Injectable, NestMiddleware} from '@nestjs/common';
import {NextFunction, Request, Response} from 'express';
import {getOauthClient} from '../../utils/oauthClient';

@Injectable()
export class CheckOauthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    let tokenInfo;
    const token = req.header('x-google-token');

    try {
      tokenInfo = await getOauthClient().getTokenInfo(token);
      console.log(tokenInfo);
    } catch (el) {
      throw new HttpException('No/invalid email', 400);
    }

    if (tokenInfo.email_verified && tokenInfo.email.endsWith('@publishers-clickadilla.com')) {
      next();
    } else {
      throw new HttpException('No/invalid email', 400);
    }
  }
}

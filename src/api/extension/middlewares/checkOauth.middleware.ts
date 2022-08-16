import {HttpException, Injectable, NestMiddleware} from '@nestjs/common';
import {NextFunction, Request, Response} from 'express';
import {getOauthClient} from '../../utils/oauthClient';

@Injectable()
export class CheckOauthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    let tokenInfo;
    let token = req.header('x-google-token');

    try {
      tokenInfo = await getOauthClient().getTokenInfo(token);
    } catch (el) {
      throw new HttpException('No/invalid email', 400);
    }

    if (tokenInfo.email_verified == true || tokenInfo.email.indexOf('@publishers-clickadilla.com') > 0) {
      next();
    } else {
      throw new HttpException('No/invalid email', 400);
    }
  }
}

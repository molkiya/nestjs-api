import {HttpException, Inject, Injectable, NestMiddleware} from '@nestjs/common';
import {NextFunction, Request, Response} from 'express';
import Redis from 'ioredis';
import {getOauthClient} from '../../utils/oauthClient';

@Injectable()
export class CheckOauthMiddleware implements NestMiddleware {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const oauthBearerToken = String(req.headers['authorization'] || '');
    if (!oauthBearerToken.startsWith('Bearer ')) {
      throw new HttpException('Bad Request', 400);
    }
    const oauthToken: string = oauthBearerToken.substring(7, oauthBearerToken.length);
    const redisResult = await this.redis.get(oauthToken);
    if (redisResult) {
      next();
    } else {
      let newOauthToken;
      try {
        newOauthToken = await getOauthClient().getTokenInfo(oauthToken);
      } catch (e) {
        throw new HttpException('Bad Request', 400);
      }
      if (
        newOauthToken.email_verified &&
        newOauthToken.email.endsWith('@publishers-clickadilla.com' || '@onlinesup.com')
      ) {
        const time = this.seconds_since_epoch(newOauthToken.expiry_date) - this.seconds_since_epoch(Date.now());
        const value = Buffer.from(JSON.stringify(newOauthToken));
        await this.redis.set(oauthToken.toString(), value, 'EX', Number(time));
        next();
      } else {
        throw new HttpException('Bad Request', 400);
      }
    }
  }

  private seconds_since_epoch(d) {
    return Math.floor(d / 1000);
  }
}

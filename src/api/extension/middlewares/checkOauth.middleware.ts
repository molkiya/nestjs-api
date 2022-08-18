import {HttpException, Inject, Injectable, NestMiddleware} from '@nestjs/common';
import {NextFunction, Request, Response} from 'express';
import Redis from 'ioredis';
import {getOauthClient} from '../../utils/oauthClient.utils';
import {DOMAIN_LIST} from '../../utils/emailDomen.utils';

@Injectable()
export class CheckOauthMiddleware implements NestMiddleware {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const oauthToken: string = this.oauth_token(req);

    const redisResult = await this.redis.get(oauthToken);

    console.log('token', {
      oauthToken,
      redisResult,
    });

    if (redisResult) {
      next();
    } else {
      let newOauthToken;

      try {
        newOauthToken = await getOauthClient().getTokenInfo(oauthToken);
        console.log('newOauthToken', newOauthToken);
      } catch (e) {
        throw new HttpException('Bad Request', 400);
      }

      if (
        newOauthToken.email_verified &&
        DOMAIN_LIST.map((DOMAIN: string) => {
          if (newOauthToken.email === DOMAIN) {
            return true;
          }
        })
        // newOauthToken.email.endsWith('@publishers-clickadilla.com' || '@onlinesup.com')
      ) {
        const time = this.seconds_since_epoch(newOauthToken.expiry_date) - this.seconds_since_epoch(Date.now());
        await this.redis.expire(oauthToken.toString(), time);
        next();
      } else {
        console.log('DOMAIN');
        throw new HttpException('Bad Request', 400);
      }
    }
  }

  private seconds_since_epoch(d): number {
    return Math.floor(d / 1000);
  }

  private oauth_token(req): string {
    const oauthBearerToken = String(req.headers['authorization'] || '');
    if (!oauthBearerToken || !oauthBearerToken.startsWith('Bearer ')) {
      throw new HttpException('Bad Request', 400);
    }
    console.log('token', oauthBearerToken);
    return oauthBearerToken.substring(7, oauthBearerToken.length);
  }
}

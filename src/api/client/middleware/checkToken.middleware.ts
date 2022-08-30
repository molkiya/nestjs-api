import {HttpException, Inject, Injectable, NestMiddleware} from '@nestjs/common';
import {NextFunction, Request, Response} from 'express';
import Redis from 'ioredis';
import {getOauthClient} from '../../utils/oauthClient.utils';
import {DOMAIN_LIST} from '../../utils/email.utils';
import {PG_CONNECTION} from '../../utils/pgConnection';

@Injectable()
export class CheckOauthMiddlewareClient implements NestMiddleware {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
    @Inject(PG_CONNECTION)
    private readonly pg: any,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const oauthToken: string = this.oauth_token(req);

    const redisResult = await this.redis.get(oauthToken);

    console.log('tokenClient', {
      oauthToken,
      redisResult,
    });

    if (redisResult) {
      const redis = JSON.parse(redisResult);
      console.log(redis);
      res.locals.account = redis.accountRedis.account;
      next();
    } else {
      let newOauthToken;

      try {
        newOauthToken = await getOauthClient().getTokenInfo(oauthToken);
        console.log('newOauthToken', newOauthToken);
      } catch (e) {
        throw new HttpException('Unauthorized', 401);
      }

      if (
        newOauthToken.email_verified &&
        DOMAIN_LIST.map((DOMAIN: string) => {
          return newOauthToken.email.endsWith(DOMAIN);
        }).includes(true)
      ) {
        let account = await this.pg.query(`SELECT * FROM accounts WHERE email = '${newOauthToken.email}'`);

        if (!account.rows[0]) {
          await this.pg.query(`INSERT INTO accounts (email) VALUES ('${newOauthToken.email}');`);
          account = await this.pg.query(`SELECT * FROM accounts WHERE email = '${newOauthToken.email}'`);
        }

        const time = this.seconds_since_epoch(newOauthToken.expiry_date) - this.seconds_since_epoch(Date.now());
        await this.redis.set(
          oauthToken.toString(),
          Buffer.from(
            JSON.stringify({
              newOauthTokenRedis: newOauthToken,
              accountRedis: account.rows[0],
            }),
          ),
        );
        await this.redis.expire(oauthToken.toString(), time);
        console.log(account.rows[0].account);
        res.locals.account = account.rows[0].account;
        next();
      } else {
        throw new HttpException('Unauthorized', 401);
      }
    }
  }

  private seconds_since_epoch(d): number {
    return Math.floor(d / 1000);
  }

  private oauth_token(req): string {
    const oauthBearerToken = String(req.headers['authorization'] || '');
    if (!oauthBearerToken || !oauthBearerToken.startsWith('Bearer ')) {
      throw new HttpException('Unauthorized', 401);
    }
    console.log('token', oauthBearerToken);
    return oauthBearerToken.substring(7, oauthBearerToken.length);
  }
}

import {OAuth2Client} from 'google-auth-library';
import {CLIENT_ID, CLIENT_SECRET, REDIRECT_URL} from '../../config/app/app.config';
import {HttpException} from '@nestjs/common';

let oAuth2Client: OAuth2Client | null = null;

export function initOauth() {
  oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

  if (!oAuth2Client._clientId || !oAuth2Client._clientSecret) {
    throw new HttpException('OAuth google failed', 400);
  }
}

export function getOauthClient() {
  return oAuth2Client;
}

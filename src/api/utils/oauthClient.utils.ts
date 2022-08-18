import {OAuth2Client} from 'google-auth-library';
import {CLIENT_ID, CLIENT_SECRET, REDIRECT_URL} from '../../config/app/app.config';
import {HttpException} from '@nestjs/common';

let oAuth2Client: OAuth2Client | null = null;

export function initOauth() {
  oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
}

export function getOauthClient() {
  if (oAuth2Client == null) {
    throw new HttpException('OAuth google failed', 400);
  } else {
    return oAuth2Client;
  }
}

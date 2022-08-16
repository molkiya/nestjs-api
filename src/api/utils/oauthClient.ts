import {OAuth2Client} from 'google-auth-library';
import {CLIENT_ID, CLIENT_SECRET, REDIRECT_URL} from '../../app.environments';

let oAuth2Client: OAuth2Client | null = null;

export function initOauth() {
  oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
}

export function getOauthClient() {
  if (oAuth2Client == null) {
  } else {
    return oAuth2Client;
  }
}

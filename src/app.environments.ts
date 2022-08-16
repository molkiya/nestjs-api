import * as dotenv from 'dotenv';
dotenv.config();

export const DB_HOST = process.env.DB_HOST || 'postgres';
export const DB_PORT = Number(process.env.DB_PORT) || 5432;
export const DB_USERNAME = process.env.DB_USERNAME || 'user';
export const DB_PASSWORD = process.env.DB_PASSWORD || 'password';
export const DB_NAME = process.env.DB_NAME || 'db';
export const DB_DEV = JSON.parse(process.env.DB_DEV);

export const CLIENT_ID = process.env.CLIENT_ID;
export const CLIENT_SECRET = process.env.CLIENT_SECRET;
export const REDIRECT_URL = process.env.REDIRECT_URL;

export const APP_PORT = process.env.APP_PORT || 3000;

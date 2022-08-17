import * as dotenv from 'dotenv';

dotenv.config();

export const DB_HOST: string = process.env.DB_HOST || 'databases';
export const DB_PORT: number = Number(process.env.DB_PORT) || 5432;
export const DB_USERNAME: string = process.env.DB_USERNAME || 'user';
export const DB_PASSWORD: string = process.env.DB_PASSWORD || 'password';
export const DB_NAME: string = process.env.DB_NAME || 'db';
export const DB_DEV: boolean = JSON.parse(process.env.DB_DEV);

export const CLIENT_ID: string = process.env.CLIENT_ID;
export const CLIENT_SECRET: string = process.env.CLIENT_SECRET;
export const REDIRECT_URL: string = process.env.REDIRECT_URL;

export const REDIS_HOST: string = process.env.REDIS_HOST;
export const REDIS_PORT = Number(process.env.REDIS_PORT);
export const REDIS_PASSWORD: string = process.env.REDIS_PASSWORD || 'password';

export const APP_PORT: number = Number(process.env.APP_PORT) || 3000;

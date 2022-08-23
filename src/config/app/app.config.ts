import * as dotenv from 'dotenv';

dotenv.config();

export const POSTGRESQL_DB_HOST: string = process.env.POSTGRESQL_DB_HOST || 'databases';
export const POSTGRESQL_DB_PORT: number = Number(process.env.POSTGRESQL_DB_PORT) || 5432;
export const POSTGRESQL_DB_USERNAME: string = process.env.POSTGRESQL_DB_USERNAME || 'user';
export const POSTGRESQL_DB_PASSWORD: string = process.env.POSTGRESQL_DB_PASSWORD || 'password';
export const POSTGRESQL_DB_NAME: string = process.env.POSTGRESQL_DB_NAME || 'db';

export const MONGODB_HOST: string = process.env.MONGODB_HOST || 'databases';
export const MONGODB_PORT: number = Number(process.env.MONGODB_PORT) || 27017;
export const MONGODB_USERNAME: string = process.env.MONGODB_USERNAME || 'user';
export const MONGODB_PASSWORD: string = process.env.MONGODB_PASSWORD || 'password';

export const DB_DEV: boolean = JSON.parse(process.env.DB_DEV);

export const CLIENT_ID: string = process.env.CLIENT_ID;
export const CLIENT_SECRET: string = process.env.CLIENT_SECRET;
export const REDIRECT_URL: string = process.env.REDIRECT_URL;

export const REDIS_HOST: string = process.env.REDIS_HOST;
export const REDIS_PORT = Number(process.env.REDIS_PORT);
export const REDIS_PASSWORD: string = process.env.REDIS_PASSWORD || 'password';

export const APP_PORT: number = Number(process.env.APP_PORT) || 3000;

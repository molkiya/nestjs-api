import {Pool} from 'pg';
import {
  POSTGRESQL_DB_HOST,
  POSTGRESQL_DB_NAME,
  POSTGRESQL_DB_PASSWORD,
  POSTGRESQL_DB_PORT,
  POSTGRESQL_DB_USERNAME,
} from '../../config/app/app.config';
import * as fs from 'fs';

export const pgInit = async () => {
  const pool = new Pool({
    user: POSTGRESQL_DB_USERNAME,
    host: POSTGRESQL_DB_HOST,
    database: POSTGRESQL_DB_NAME,
    password: POSTGRESQL_DB_PASSWORD,
    port: POSTGRESQL_DB_PORT,
  });

  const sites = fs.readFileSync('src/shared/ddl/sites.ddl').toString();
  await pool.query(sites);
  console.log(sites);
  const accounts = fs.readFileSync('src/shared/ddl/accounts.ddl').toString();
  await pool.query(accounts);
  console.log(accounts);
};

import pg from 'pg';

import dotenv from 'dotenv';
dotenv.config();
const databaseConfig = { connectionString: process.env.DATABASE_URL };

const Pool = pg.Pool;
const pool = new Pool(databaseConfig);

module.exports = {
  pool,
};

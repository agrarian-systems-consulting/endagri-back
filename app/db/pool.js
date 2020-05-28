const Pool = require('pg').Pool

require('dotenv').config()

const databaseConfig = { connectionString: process.env.DATABASE_URL };
const pool = new Pool(databaseConfig);

module.exports = {
    pool,
}
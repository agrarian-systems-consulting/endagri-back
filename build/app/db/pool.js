"use strict";

var _pg = _interopRequireDefault(require("pg"));

var _dotenv = _interopRequireDefault(require("dotenv"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv.default.config();

const databaseConfig = {
  connectionString: process.env.DATABASE_URL
};
const Pool = _pg.default.Pool;
const pool = new Pool(databaseConfig);
module.exports = {
  pool
};
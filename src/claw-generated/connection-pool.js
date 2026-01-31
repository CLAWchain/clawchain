const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // 30 seconds
  connectionTimeoutMillis: 2000, // 2 seconds
});

async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } catch (err) {
    console.error('Error executing query:', err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  query,
};
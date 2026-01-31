import { ConnectionPool } from './connection-pool';

const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'clawchain',
  user: 'clawchain',
  password: 'secret'
};

const pool = ConnectionPool.getInstance(dbConfig);

export async function query(sql: string, params?: any[]): Promise<any> {
  return await pool.query(sql, params);
}

export async function close(): Promise<void> {
  await pool.close();
}
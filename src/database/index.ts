import { ConnectionPool } from './connection-pool';

const poolConfig = {
  user: 'myuser',
  password: 'mypassword',
  host: 'localhost',
  port: 5432,
  database: 'clawchain'
};

const connectionPool = new ConnectionPool(poolConfig);

export async function query(text: string, params?: any[]): Promise<any> {
  return await connectionPool.query(text, params);
}

export async function end(): Promise<void> {
  await connectionPool.end();
}
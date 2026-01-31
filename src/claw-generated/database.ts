import ConnectionPool from './database/connection_pool';

const connectionPool = new ConnectionPool({
  host: 'localhost',
  user: 'myuser',
  password: 'mypassword',
  database: 'clawchain'
});

export async function queryDatabase(sql: string, params?: any[]): Promise<any> {
  return await connectionPool.query(sql, params);
}

export async function closeDatabase(): Promise<void> {
  await connectionPool.end();
}

export default connectionPool;
import ConnectionPoolManager from './connection-pool';

const config = {
  user: 'your_username',
  host: 'localhost',
  database: 'claw_chain',
  password: 'your_password',
  port: 5432,
};

const poolManager = new ConnectionPoolManager(config);

export async function query(sql: string, params?: any[]): Promise<any> {
  const client = await poolManager.getClient();
  try {
    const result = await client.query(sql, params);
    return result.rows;
  } catch (err) {
    console.error('Error executing query:', err);
    throw err;
  } finally {
    await poolManager.release(client);
  }
}

export async function end(): Promise<void> {
  await poolManager.end();
}
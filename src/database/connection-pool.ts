import { createPool, Pool, PoolConfig } from 'pg';

export class ConnectionPool {
  private pool: Pool;

  constructor(config: PoolConfig) {
    this.pool = createPool(config);
  }

  async getConnection(): Promise<any> {
    try {
      return await this.pool.connect();
    } catch (err) {
      console.error('Error getting connection from pool:', err);
      throw err;
    }
  }

  async query(text: string, params?: any[]): Promise<any> {
    const client = await this.getConnection();
    try {
      return await client.query(text, params);
    } catch (err) {
      console.error('Error executing query:', err);
      throw err;
    } finally {
      client.release();
    }
  }

  async end(): Promise<void> {
    await this.pool.end();
  }
}
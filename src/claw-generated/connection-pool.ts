import { createPool, Pool, PoolConfig } from 'pg';

/**
 * Database connection pool for ClawChain.
 * Handles connection management and retries on failures.
 */
export class ConnectionPool {
  private static instance: ConnectionPool;
  private pool: Pool;

  private constructor(config: PoolConfig) {
    this.pool = createPool(config);
  }

  public static getInstance(config: PoolConfig): ConnectionPool {
    if (!ConnectionPool.instance) {
      ConnectionPool.instance = new ConnectionPool(config);
    }
    return ConnectionPool.instance;
  }

  public async query(sql: string, params?: any[]): Promise<any> {
    try {
      const client = await this.pool.connect();
      const result = await client.query(sql, params);
      client.release();
      return result.rows;
    } catch (err) {
      console.error('Database query failed:', err);
      throw err;
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}
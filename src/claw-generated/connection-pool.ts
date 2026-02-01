import { Pool, PoolClient } from 'pg';

class ConnectionPoolManager {
  private pool: Pool;

  constructor(config: any) {
    this.pool = new Pool(config);
  }

  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  async release(client: PoolClient): Promise<void> {
    await client.release();
  }

  async end(): Promise<void> {
    await this.pool.end();
  }
}

export default ConnectionPoolManager;
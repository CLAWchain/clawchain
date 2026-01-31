import { Pool, PoolClient } from 'pg';
import Redis from 'ioredis';
import { db, cache } from './db';

class DatabaseConnectionPool {
  private pool: Pool;
  private redis: Redis;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 100, 3000),
    });
  }

  async getClient(): Promise<PoolClient> {
    try {
      return await this.pool.connect();
    } catch (error) {
      console.error('Error getting database client:', error);
      throw error;
    }
  }

  async query(text: string, params: any[] = []): Promise<{ rows: any[]; rowCount?: number }> {
    let client: PoolClient;
    try {
      client = await this.getClient();
      const result = await client.query(text, params);
      client.release();
      return { rows: result.rows, rowCount: result.rowCount || 0 };
    } catch (error) {
      console.error('Database query error:', error);
      if (client) client.release();
      throw error;
    }
  }

  async exec(sql: string): Promise<void> {
    let client: PoolClient;
    try {
      client = await this.getClient();
      const statements = sql.split(';').filter(s => s.trim().length > 0);
      for (const statement of statements) {
        await client.query(statement);
      }
      client.release();
    } catch (error) {
      console.error('Database exec error:', error);
      if (client) client.release();
      throw error;
    }
  }

  async connect(): Promise<boolean> {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      return true;
    } catch (error) {
      console.error('PostgreSQL connection failed:', error);
      return false;
    }
  }

  async end(): Promise<void> {
    await this.pool.end();
    await this.redis.disconnect();
  }
}

export const databasePool = new DatabaseConnectionPool();
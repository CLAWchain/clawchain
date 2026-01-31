import { Pool, PoolClient } from 'pg';
import Redis from 'ioredis';
import { db, cache } from './db';

class DatabaseConnectionPool {
  private pool: Pool;
  private redis: Redis;
  private maxPoolSize: number = 20;
  private connectionTimeoutMs: number = 2000;
  private idleTimeoutMs: number = 30000;
  private maxRetries: number = 3;
  private retryDelayMs: number = 100;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: this.maxPoolSize,
      idleTimeoutMillis: this.idleTimeoutMs,
      connectionTimeoutMillis: this.connectionTimeoutMs,
    });

    this.redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: this.maxRetries,
      retryStrategy: (times) => Math.min(times * this.retryDelayMs, 3000),
    });
  }

  async getClient(): Promise<PoolClient> {
    let retries = 0;
    while (retries < this.maxRetries) {
      try {
        return await this.pool.connect();
      } catch (error) {
        console.error('Error getting database client:', error);
        retries++;
        await new Promise((resolve) => setTimeout(resolve, this.retryDelayMs * retries));
      }
    }
    throw new Error('Failed to get database client after multiple retries');
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
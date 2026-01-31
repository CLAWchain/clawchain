import { databasePool } from './DatabaseConnectionPool';
import LRUCache from 'lru-cache';

class DatabaseCache {
  private cache: LRUCache<string, any>;
  private static instance: DatabaseCache;

  private constructor(maxSize: number) {
    this.cache = new LRUCache({
      max: maxSize,
      ttl: 60 * 60 * 1000, // 1 hour
    });
  }

  public static getInstance(maxSize: number = 1000): DatabaseCache {
    if (!DatabaseCache.instance) {
      DatabaseCache.instance = new DatabaseCache(maxSize);
    }
    return DatabaseCache.instance;
  }

  async query(sql: string, params: any[]): Promise<any> {
    const cacheKey = this.getCacheKey(sql, params);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const { rows } = await databasePool.query(sql, params);
    this.cache.set(cacheKey, rows);
    return rows;
  }

  private getCacheKey(sql: string, params: any[]): string {
    return `${sql}:${JSON.stringify(params)}`;
  }
}

export { DatabaseCache };
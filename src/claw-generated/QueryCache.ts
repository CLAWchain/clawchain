import { Database } from './Database';

class QueryCache {
  private cache: Map<string, any>;
  private maxSize: number;
  private database: Database;

  constructor(database: Database, maxSize: number = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.database = database;
  }

  async get(sql: string, params: any[]): Promise<any> {
    const cacheKey = this.getCacheKey(sql, params);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = await this.database.query(sql, params);
    this.cache.set(cacheKey, result);

    if (this.cache.size > this.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    return result;
  }

  private getCacheKey(sql: string, params: any[]): string {
    return `${sql}:${JSON.stringify(params)}`;
  }

  private evictLeastRecentlyUsed() {
    const keys = Array.from(this.cache.keys());
    this.cache.delete(keys[0]);
  }
}

export { QueryCache };
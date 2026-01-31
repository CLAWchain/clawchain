import { Database } from './Database';
import { QueryCache } from './QueryCache';

class DatabaseWithCache extends Database {
  private cache: QueryCache;

  constructor() {
    super();
    this.cache = new QueryCache(this);
  }

  async query(sql: string, params: any[]): Promise<any> {
    return this.cache.get(sql, params);
  }

  // Override other database methods to use the cache
}

export { DatabaseWithCache };
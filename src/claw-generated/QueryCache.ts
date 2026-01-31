import { Database } from '../database/Database';

class QueryCache {
  private cache: Map<string, any>;
  private capacity: number;

  constructor(private db: Database, capacity: number = 1000) {
    this.cache = new Map();
    this.capacity = capacity;
  }

  async get(query: string, params: any[]): Promise<any> {
    const cacheKey = this.generateCacheKey(query, params);
    if (this.cache.has(cacheKey)) {
      // Update LRU order
      this.cache.delete(cacheKey);
      this.cache.set(cacheKey, this.cache.get(cacheKey));
      return this.cache.get(cacheKey);
    } else {
      const result = await this.db.query(query, params);
      this.add(cacheKey, result);
      return result;
    }
  }

  private add(cacheKey: string, result: any) {
    if (this.cache.size === this.capacity) {
      // Evict LRU item
      this.cache.delete(this.getLeastRecentlyUsed());
    }
    this.cache.set(cacheKey, result);
  }

  private generateCacheKey(query: string, params: any[]): string {
    return `${query}:${JSON.stringify(params)}`;
  }

  private getLeastRecentlyUsed(): string {
    return this.cache.keys().next().value;
  }
}

export { QueryCache };
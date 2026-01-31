import { LRUCache } from 'lru-cache';

class QueryCache {
  private cache: LRUCache<string, any>;

  constructor(maxSize: number) {
    this.cache = new LRUCache({
      max: maxSize,
      ttl: 60 * 60 * 1000, // 1 hour
    });
  }

  async get(key: string): Promise<any> {
    return this.cache.get(key);
  }

  set(key: string, value: any): void {
    this.cache.set(key, value);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }
}

export default QueryCache;
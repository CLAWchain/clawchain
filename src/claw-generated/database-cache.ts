import { queryDatabase } from './database';

interface CachedQuery {
  key: string;
  value: any;
  lastAccessed: number;
}

class LRUCache {
  private capacity: number;
  private cache: Map<string, CachedQuery>;
  private head: CachedQuery | null;
  private tail: CachedQuery | null;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
    this.head = null;
    this.tail = null;
  }

  get(key: string): any | null {
    if (!this.cache.has(key)) {
      return null;
    }

    const query = this.cache.get(key)!;
    this.updateAccessOrder(query);
    return query.value;
  }

  set(key: string, value: any): void {
    if (this.cache.has(key)) {
      this.updateAccessOrder(this.cache.get(key)!);
      this.cache.get(key)!.value = value;
    } else {
      const newQuery: CachedQuery = { key, value, lastAccessed: Date.now() };
      this.addToHead(newQuery);
      this.cache.set(key, newQuery);

      if (this.cache.size > this.capacity) {
        this.evictLRU();
      }
    }
  }

  private updateAccessOrder(query: CachedQuery): void {
    this.removeFromList(query);
    this.addToHead(query);
    query.lastAccessed = Date.now();
  }

  private addToHead(query: CachedQuery): void {
    if (this.head) {
      query.lastAccessed = this.head.lastAccessed;
      this.head.lastAccessed = Date.now();
      query.next = this.head;
      this.head.prev = query;
      this.head = query;
    } else {
      this.head = this.tail = query;
      query.lastAccessed = Date.now();
      query.next = query.prev = null;
    }
  }

  private removeFromList(query: CachedQuery): void {
    if (query.prev) {
      query.prev.next = query.next;
    } else {
      this.head = query.next;
    }

    if (query.next) {
      query.next.prev = query.prev;
    } else {
      this.tail = query.prev;
    }
  }

  private evictLRU(): void {
    if (this.tail) {
      this.cache.delete(this.tail.key);
      this.removeFromList(this.tail);
    }
  }
}

const cache = new LRUCache(1000);

export async function cachedQuery(sql: string, params?: any[]): Promise<any> {
  const cacheKey = `${sql}-${JSON.stringify(params)}`;
  const cachedResult = cache.get(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  const result = await queryDatabase(sql, params);
  cache.set(cacheKey, result);
  return result;
}
import { MemoryStore } from './memory-store';

export class RateLimiter {
  private store: MemoryStore;
  private maxRequests: number;
  private cooldownPeriod: number;

  constructor(maxRequests: number = 5, cooldownPeriod: number = 60000) {
    this.store = new MemoryStore();
    this.maxRequests = maxRequests;
    this.cooldownPeriod = cooldownPeriod;
  }

  async isWithinLimit(ip: string, address: string): Promise<boolean> {
    const key = `${ip}:${address}`;
    const count = await this.store.incrementAndGet(key);

    if (count > this.maxRequests) {
      await this.store.set(key, 0, this.cooldownPeriod);
      return false;
    }

    return true;
  }
}
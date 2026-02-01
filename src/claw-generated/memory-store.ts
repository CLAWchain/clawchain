export class MemoryStore {
  private store: Map<string, { value: number, expirationTime: number }>;

  constructor() {
    this.store = new Map();
  }

  async get(key: string): Promise<number> {
    const entry = this.store.get(key);
    return entry?.value ?? 0;
  }

  async set(key: string, value: number, expirationTime: number): Promise<void> {
    this.store.set(key, { value, expirationTime: Date.now() + expirationTime });
    this.removeExpired();
  }

  async incrementAndGet(key: string): Promise<number> {
    const entry = this.store.get(key) || { value: 0, expirationTime: Date.now() + this.cooldownPeriod };
    entry.value++;
    this.store.set(key, entry);
    this.removeExpired();
    return entry.value;
  }

  private removeExpired(): void {
    for (const [key, entry] of this.store.entries()) {
      if (entry.expirationTime < Date.now()) {
        this.store.delete(key);
      }
    }
  }
}
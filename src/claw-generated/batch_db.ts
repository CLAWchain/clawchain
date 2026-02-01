import { StateDatabase } from '../state/database';

export class BatchedStateDatabase implements StateDatabase {
  private db: StateDatabase;
  private batch: Map<string, Buffer>;

  constructor(db: StateDatabase) {
    this.db = db;
    this.batch = new Map();
  }

  async get(key: string): Promise<Buffer | null> {
    if (this.batch.has(key)) {
      return this.batch.get(key) || null;
    }
    return this.db.get(key);
  }

  async put(key: string, value: Buffer): Promise<void> {
    this.batch.set(key, value);
  }

  async commit(): Promise<void> {
    await this.db.batch(Array.from(this.batch.entries()));
    this.batch.clear();
  }
}
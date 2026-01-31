import { KeyValueStore } from './KeyValueStore';

class DatabaseWriteBatch {
  private batch: Map<string, any>;
  private store: KeyValueStore;

  constructor(store: KeyValueStore) {
    this.batch = new Map();
    this.store = store;
  }

  set(key: string, value: any): void {
    this.batch.set(key, value);
  }

  commit(): Promise<void> {
    return this.store.writeBatch(this.batch);
  }
}

export default DatabaseWriteBatch;
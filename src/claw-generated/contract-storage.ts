import { LevelDB } from './database';

export class ContractStorage {
  private db: LevelDB;

  constructor() {
    this.db = new LevelDB('contract-storage');
  }

  async get(key: string): Promise<any> {
    return await this.db.get(key);
  }

  async set(key: string, value: any): Promise<void> {
    await this.db.put(key, value);
  }

  async delete(key: string): Promise<void> {
    await this.db.del(key);
  }

  async getArray(key: string): Promise<any[]> {
    const value = await this.get(key);
    return Array.isArray(value) ? value : [];
  }

  async setArray(key: string, value: any[]): Promise<void> {
    await this.set(key, value);
  }

  async getMapping(key: string): Promise<Map<string, any>> {
    const value = await this.get(key);
    return value instanceof Map ? value : new Map();
  }

  async setMapping(key: string, value: Map<string, any>): Promise<void> {
    await this.set(key, value);
  }

  async query(indexName: string, value: any): Promise<string[]> {
    return await this.db.query(indexName, value);
  }

  async addIndex(indexName: string, key: string, value: any): Promise<void> {
    await this.db.addIndex(indexName, key, value);
  }
}
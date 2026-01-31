// src/claw-generated/storage.ts
import { ContractId } from '../types';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export class ContractStorage {
  private storage: Map<ContractId, Map<string, any>> = new Map();
  private storageDir = 'data/contract-storage';

  constructor() {
    this.loadStorage();
  }

  private loadStorage(): void {
    try {
      const storageData = readFileSync(join(this.storageDir, 'storage.json'), 'utf8');
      this.storage = new Map(JSON.parse(storageData));
    } catch (err) {
      // If the file doesn't exist, we'll start with an empty storage
    }
  }

  private saveStorage(): void {
    const storageData = JSON.stringify(Array.from(this.storage.entries()));
    writeFileSync(join(this.storageDir, 'storage.json'), storageData);
  }

  // Mappings and arrays methods (same as before)
  // ...
}
import { StorageSlot } from '../accounts/storage-slot';

export class ContractStorage {
  private slots: Map<string, StorageSlot> = new Map();

  get(key: string): StorageSlot {
    if (!this.slots.has(key)) {
      this.slots.set(key, new StorageSlot());
    }
    return this.slots.get(key)!;
  }

  set(key: string, value: StorageSlot): void {
    this.slots.set(key, value);
  }

  delete(key: string): void {
    this.slots.delete(key);
  }

  has(key: string): boolean {
    return this.slots.has(key);
  }

  getKeys(): string[] {
    return Array.from(this.slots.keys());
  }

  getMapping(key: string): Map<string, StorageSlot> {
    const slot = this.get(key);
    return slot.asMapping();
  }

  setMapping(key: string, mapping: Map<string, StorageSlot>): void {
    const slot = this.get(key);
    slot.setMapping(mapping);
  }

  getArray(key: string): StorageSlot[] {
    const slot = this.get(key);
    return slot.asArray();
  }

  setArray(key: string, array: StorageSlot[]): void {
    const slot = this.get(key);
    slot.setArray(array);
  }
}
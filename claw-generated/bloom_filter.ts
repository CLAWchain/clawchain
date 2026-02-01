import { hash } from 'xxhash-wasm';

class BloomFilter {
  private bits: Uint8Array;
  private numHashes: number;

  constructor(size: number, numHashes: number) {
    this.bits = new Uint8Array(size);
    this.numHashes = numHashes;
  }

  add(item: string): void {
    for (let i = 0; i < this.numHashes; i++) {
      const index = this.hash(item, i) % this.bits.length;
      this.bits[index] = 1;
    }
  }

  has(item: string): boolean {
    for (let i = 0; i < this.numHashes; i++) {
      const index = this.hash(item, i) % this.bits.length;
      if (this.bits[index] === 0) {
        return false;
      }
    }
    return true;
  }

  private hash(item: string, seed: number): number {
    return hash(item, { seed });
  }
}

export default BloomFilter;
import { keccak256 } from 'js-sha3';

class BloomFilter {
  private bits: Uint8Array;
  private size: number;
  private hashes: number;

  constructor(size: number = 2048, hashes: number = 3) {
    this.size = size;
    this.hashes = hashes;
    this.bits = new Uint8Array(size);
  }

  add(item: string): void {
    for (let i = 0; i < this.hashes; i++) {
      const index = this.hash(item, i) % this.size;
      this.bits[index] = 1;
    }
  }

  has(item: string): boolean {
    for (let i = 0; i < this.hashes; i++) {
      const index = this.hash(item, i) % this.size;
      if (this.bits[index] === 0) {
        return false;
      }
    }
    return true;
  }

  private hash(item: string, seed: number): number {
    return parseInt(keccak256(item + seed), 16);
  }
}

export { BloomFilter };
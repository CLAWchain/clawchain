import { createHash } from 'crypto';

export class BloomFilter {
  private bitArray: boolean[];
  private hashFunctions: ((data: string) => number)[];

  constructor(size: number, numHashFunctions: number) {
    this.bitArray = new Array(size).fill(false);
    this.hashFunctions = this.generateHashFunctions(numHashFunctions);
  }

  private generateHashFunctions(numFunctions: number): ((data: string) => number)[] {
    const hashFunctions = [];
    for (let i = 0; i < numFunctions; i++) {
      hashFunctions.push((data: string) => {
        const hash = createHash('sha256').update(data + i).digest('hex');
        return parseInt(hash, 16) % this.bitArray.length;
      });
    }
    return hashFunctions;
  }

  add(item: string): void {
    for (const hashFn of this.hashFunctions) {
      this.bitArray[hashFn(item)] = true;
    }
  }

  mayContain(item: string): boolean {
    for (const hashFn of this.hashFunctions) {
      if (!this.bitArray[hashFn(item)]) {
        return false;
      }
    }
    return true;
  }
}
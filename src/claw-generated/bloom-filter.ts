import { eventBus } from './EventBus';

/**
 * BloomFilter is a probabilistic data structure used to quickly determine whether an element is likely to be in a set or not.
 * It is used in ClawChain to efficiently filter blocks for event queries.
 */
export class BloomFilter {
  private bitArray: Uint8Array;
  private numHashFunctions: number;
  private size: number;

  constructor(size: number = 1024, numHashFunctions: number = 3) {
    this.size = size;
    this.numHashFunctions = numHashFunctions;
    this.bitArray = new Uint8Array(size);
  }

  /**
   * Add an element to the bloom filter.
   * @param element - The element to add.
   */
  add(element: string): void {
    for (let i = 0; i < this.numHashFunctions; i++) {
      const index = this.hash(element, i) % this.size;
      this.bitArray[index] = 1;
    }
  }

  /**
   * Check if an element is likely to be in the bloom filter.
   * @param element - The element to check.
   * @returns True if the element is likely to be in the bloom filter, false otherwise.
   */
  has(element: string): boolean {
    for (let i = 0; i < this.numHashFunctions; i++) {
      const index = this.hash(element, i) % this.size;
      if (this.bitArray[index] === 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * Reset the bloom filter to its initial state.
   */
  reset(): void {
    this.bitArray.fill(0);
  }

  /**
   * Hash function used to map elements to bit indices in the bloom filter.
   * @param element - The element to hash.
   * @param seed - The seed for the hash function.
   * @returns The hash value.
   */
  private hash(element: string, seed: number): number {
    let hash = 0;
    for (let i = 0; i < element.length; i++) {
      hash = (hash << 5) - hash + element.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash + seed);
  }
}

// Register the bloom filter with the EventBus
eventBus.on('block_produced', (data) => {
  eventBus.updateBlockBloomFilter(data.blockNumber, data.events);
});

eventBus.on('transaction_added', (data) => {
  eventBus.updateBlockBloomFilter(data.blockNumber, data.events);
});
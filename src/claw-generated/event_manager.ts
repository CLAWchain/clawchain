import { BloomFilter } from '../utils/bloom_filter';

class EventManager {
  private blockBloomFilters: Map<number, BloomFilter> = new Map();

  async queryEvents(blockRange: [number, number], eventTopics: string[]) {
    // Use bloom filters to quickly filter out blocks that don't contain the requested events
    const filteredBlocks = await this.filterBlocksWithBloom(blockRange, eventTopics);

    // Perform the full event query on the filtered blocks
    const events = await this.queryEventsFromBlocks(filteredBlocks, eventTopics);
    return events;
  }

  private async filterBlocksWithBloom(blockRange: [number, number], eventTopics: string[]) {
    const filteredBlocks: number[] = [];

    for (let i = blockRange[0]; i <= blockRange[1]; i++) {
      const bloomFilter = this.getOrCreateBloomFilter(i);
      if (this.matchesEventTopics(bloomFilter, eventTopics)) {
        filteredBlocks.push(i);
      }
    }

    return filteredBlocks;
  }

  private getOrCreateBloomFilter(blockNumber: number): BloomFilter {
    if (!this.blockBloomFilters.has(blockNumber)) {
      // Create a new bloom filter for the block and add it to the cache
      const bloomFilter = new BloomFilter(1000, 0.01);
      this.blockBloomFilters.set(blockNumber, bloomFilter);
    }
    return this.blockBloomFilters.get(blockNumber)!;
  }

  private matchesEventTopics(bloomFilter: BloomFilter, eventTopics: string[]): boolean {
    return eventTopics.every(topic => bloomFilter.mayContain(topic));
  }
}

export { EventManager };
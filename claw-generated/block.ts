import BloomFilter from './bloom_filter';

class Block {
  private bloomFilter: BloomFilter;
  private eventLogs: string[];

  constructor() {
    this.bloomFilter = new BloomFilter(1000, 3);
    this.eventLogs = [];
  }

  addEventLog(log: string): void {
    this.eventLogs.push(log);
    this.bloomFilter.add(log);
  }

  queryEventLogs(query: string): string[] {
    return this.eventLogs.filter(log => log.includes(query));
  }

  getBloomFilter(): BloomFilter {
    return this.bloomFilter;
  }
}

export default Block;
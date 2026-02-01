import { Event } from './event';

export class TransactionReceipt {
  constructor(
    public status: boolean,
    public gasUsed: number,
    public events: Event[],
    public bloomFilter: number[]
  ) {
    this.bloomFilter = this.generateBloomFilter();
  }

  private generateBloomFilter(): number[] {
    // Implement bloom filter generation logic here
    return [1, 2, 3];
  }
}
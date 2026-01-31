import { BloomFilter } from './bloom-filter';

export class TransactionReceipt {
  status: 'success' | 'failure';
  gasUsed: number;
  logs: any[];
  bloomFilter: BloomFilter;

  constructor(data: {
    status: 'success' | 'failure';
    gasUsed: number;
    logs: any[];
    bloomFilter: BloomFilter;
  }) {
    this.status = data.status;
    this.gasUsed = data.gasUsed;
    this.logs = data.logs;
    this.bloomFilter = data.bloomFilter;
  }
}
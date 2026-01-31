import { BloomFilter } from './bloom-filter';

export class TransactionReceipt {
  status: boolean;
  gasUsed: number;
  logs: any[];
  bloomFilter: BloomFilter;

  constructor(status: boolean, gasUsed: number, logs: any[], bloomFilter: BloomFilter) {
    this.status = status;
    this.gasUsed = gasUsed;
    this.logs = logs;
    this.bloomFilter = bloomFilter;
  }
}
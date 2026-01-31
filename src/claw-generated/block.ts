import { BloomFilter } from './bloom-filter';

export class Block {
  hash: string;
  number: number;
  timestamp: number;
  transactions: Transaction[];
  bloom: BloomFilter;

  constructor(hash: string, number: number, timestamp: number, transactions: Transaction[]) {
    this.hash = hash;
    this.number = number;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.bloom = this.generateBloom();
  }

  private generateBloom(): BloomFilter {
    const bloom = new BloomFilter(1024, 3);
    for (const tx of this.transactions) {
      bloom.add(tx.hash);
      bloom.add(tx.from);
      bloom.add(tx.to);
    }
    return bloom;
  }
}

export class Transaction {
  hash: string;
  from: string;
  to: string;
  value: number;
  data: string;
}
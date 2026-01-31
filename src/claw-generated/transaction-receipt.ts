import { Transaction } from './transaction';

export class TransactionReceipt {
  private status: number;
  private gasUsed: number;
  private logs: any[];
  private bloomFilter: string;
  private transaction: Transaction;

  constructor(transaction: Transaction, status: number, gasUsed: number, logs: any[], bloomFilter: string) {
    this.transaction = transaction;
    this.status = status;
    this.gasUsed = gasUsed;
    this.logs = logs;
    this.bloomFilter = bloomFilter;
  }

  getStatus(): number {
    return this.status;
  }

  getGasUsed(): number {
    return this.gasUsed;
  }

  getLogs(): any[] {
    return this.logs;
  }

  getBloomFilter(): string {
    return this.bloomFilter;
  }

  getTransaction(): Transaction {
    return this.transaction;
  }
}
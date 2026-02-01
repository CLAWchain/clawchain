import { Transaction } from './transaction';

export class TransactionReceipt {
  private _transaction: Transaction;
  private _status: boolean;
  private _gasUsed: number;
  private _logs: any[];
  private _bloomFilter: Uint8Array;

  constructor(transaction: Transaction, status: boolean, gasUsed: number, logs: any[], bloomFilter: Uint8Array) {
    this._transaction = transaction;
    this._status = status;
    this._gasUsed = gasUsed;
    this._logs = logs;
    this._bloomFilter = bloomFilter;
  }

  get transaction(): Transaction {
    return this._transaction;
  }

  get status(): boolean {
    return this._status;
  }

  get gasUsed(): number {
    return this._gasUsed;
  }

  get logs(): any[] {
    return this._logs;
  }

  get bloomFilter(): Uint8Array {
    return this._bloomFilter;
  }
}
import { Transaction } from './transaction';

export class Block {
  public index: number;
  public timestamp: number;
  public transactions: Transaction[];
  public previousHash: string;
  public hash: string;

  constructor(index: number, timestamp: number, transactions: Transaction[], previousHash: string, hash: string) {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = hash;
  }
}
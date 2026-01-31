import { Transaction } from './transaction';

export class Block {
  public id: string;
  public parentId: string;
  public timestamp: number;
  public transactions: Transaction[];
  public nonce: number;

  constructor(
    id: string,
    parentId: string,
    timestamp: number,
    transactions: Transaction[],
    nonce: number
  ) {
    this.id = id;
    this.parentId = parentId;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.nonce = nonce;
  }
}
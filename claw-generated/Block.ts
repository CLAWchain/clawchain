import { TransactionReceipt } from './TransactionReceipt';

export class Block {
  public hash: string;
  public parentHash: string;
  public timestamp: number;
  public transactions: TransactionReceipt[];
  public finalized: boolean = false;
  public finalityConfirmations: number = 0;

  constructor(
    hash: string,
    parentHash: string,
    timestamp: number,
    transactions: TransactionReceipt[]
  ) {
    this.hash = hash;
    this.parentHash = parentHash;
    this.timestamp = timestamp;
    this.transactions = transactions;
  }

  public setFinalized(confirmations: number) {
    this.finalized = true;
    this.finalityConfirmations = confirmations;
  }
}
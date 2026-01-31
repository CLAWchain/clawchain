import { TransactionSigner } from './crypto/transaction-signer';
import { Transaction } from './transaction';

export class Block {
  public readonly index: number;
  public readonly timestamp: number;
  public readonly data: Transaction[];
  public readonly previousHash: string;
  public readonly hash: string;
  public readonly size: number;
  private transactionSigner: TransactionSigner;

  constructor(
    index: number,
    timestamp: number,
    data: Transaction[],
    previousHash: string,
    hash: string,
    size: number
  ) {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = hash;
    this.size = size;
    this.transactionSigner = new TransactionSigner();
  }

  verifyTransactions(): boolean {
    for (const tx of this.data) {
      if (!this.transactionSigner.verifyTransaction(tx)) {
        return false;
      }
    }
    return true;
  }
}
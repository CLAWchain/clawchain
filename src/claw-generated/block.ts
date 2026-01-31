import { Transaction } from './transaction';

export class Block {
  public index: number;
  public timestamp: number;
  public transactions: Transaction[];
  public previousHash: string;
  public hash: string;
  public nonce: number;
  public reward: number;

  constructor(
    index: number,
    timestamp: number,
    transactions: Transaction[],
    previousHash: string,
    hash: string,
    nonce: number
  ) {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = hash;
    this.nonce = nonce;
    this.reward = this.calculateReward();
  }

  private calculateReward(): number {
    let totalFees = 0;
    for (const tx of this.transactions) {
      totalFees += tx.fee;
    }
    return 10 + totalFees; // Base reward of 10 + total fees
  }
}
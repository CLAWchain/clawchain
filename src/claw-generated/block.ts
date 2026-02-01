import { hash } from '../utils/crypto';

export class Block {
  timestamp: number;
  previousHash: string;
  transactions: any[];
  nonce: number;

  constructor(timestamp: number, previousHash: string, transactions: any[], nonce: number) {
    this.timestamp = timestamp;
    this.previousHash = previousHash;
    this.transactions = transactions;
    this.nonce = nonce;
  }

  getHash(): string {
    return hash(
      this.timestamp,
      this.previousHash,
      JSON.stringify(this.transactions),
      this.nonce
    );
  }

  isValid(): boolean {
    // TODO: Implement block validation logic
    return true;
  }

  serialize(): string {
    return JSON.stringify({
      timestamp: this.timestamp,
      previousHash: this.previousHash,
      transactions: this.transactions,
      nonce: this.nonce
    });
  }

  static deserialize(data: string): Block {
    const { timestamp, previousHash, transactions, nonce } = JSON.parse(data);
    return new Block(timestamp, previousHash, transactions, nonce);
  }
}
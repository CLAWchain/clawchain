import { Transaction } from './transaction';
import { TransactionPool } from './TransactionPool';
import { Crypto } from './crypto/signing';

export class Block {
  readonly timestamp: number;
  readonly transactions: Transaction[];
  readonly previousHash: string;
  readonly hash: string;
  readonly nonce: number;

  constructor(
    timestamp: number,
    transactions: Transaction[],
    previousHash: string,
    nonce: number
  ) {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = nonce;
  }

  calculateHash(): string {
    return Crypto.hash(
      this.timestamp.toString() +
        this.transactions.map((tx) => tx.signature).join('') +
        this.previousHash +
        this.nonce.toString()
    );
  }

  static async createBlock(
    transactionPool: TransactionPool,
    previousHash: string,
    nonce: number
  ): Promise<Block> {
    // Get a random selection of transactions from the pool
    const transactions = await transactionPool.getTransactions();

    // Create the new block
    return new Block(Date.now(), transactions, previousHash, nonce);
  }
}
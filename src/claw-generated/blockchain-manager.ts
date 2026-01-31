import { Block } from './block';
import { Transaction } from './transaction';
import { Account } from './account';
import { NonceTracker } from './nonce-tracker';

export class BlockchainManager {
  private chain: Block[] = [];
  private pendingTransactions: Transaction[] = [];
  private nonceTracker: NonceTracker = new NonceTracker();

  async addTransaction(transaction: Transaction): Promise<void> {
    // Validate the transaction nonce
    if (await transaction.validate(this.nonceTracker)) {
      this.pendingTransactions.push(transaction);
    } else {
      throw new Error('Invalid transaction nonce');
    }
  }

  async processTransactions(): Promise<void> {
    for (const transaction of this.pendingTransactions) {
      try {
        await transaction.process(this.nonceTracker);
        this.chain.push(new Block(this.chain.length, this.pendingTransactions));
        this.pendingTransactions = [];
      } catch (error) {
        console.error('Error processing transaction:', error);
      }
    }
  }
}
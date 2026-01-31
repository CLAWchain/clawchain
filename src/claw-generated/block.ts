import { TransactionPool } from './transaction-pool';
import { TransactionReceipt } from './transaction-receipt';
import { BloomFilter } from './bloom-filter';

export class Block {
  transactions: Transaction[];
  transactionReceipts: TransactionReceipt[];
  finalized: boolean;
  confirmations: number;

  constructor(transactionPool: TransactionPool) {
    this.transactions = transactionPool.getTransactions();
    this.transactionReceipts = this.transactions.map((tx) => this.generateReceipt(tx));
    this.finalized = false;
    this.confirmations = 0;
  }

  private generateReceipt(tx: Transaction): TransactionReceipt {
    // Generate the receipt based on the transaction execution
    const status = 'success'; // or 'failure'
    const gasUsed = 100; // actual gas used
    const logs = []; // execution logs
    const bloomFilter = new BloomFilter(); // bloom filter

    return new TransactionReceipt({
      status,
      gasUsed,
      logs,
      bloomFilter
    });
  }

  incrementConfirmations() {
    this.confirmations++;
    if (this.confirmations >= 6) {
      this.finalized = true;
    }
  }
}

export class Transaction {
  // transaction properties
}
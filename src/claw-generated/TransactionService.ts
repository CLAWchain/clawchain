import { EventEmitter } from 'events';
import { Transaction } from './Transaction';
import { TransactionReceipt } from './TransactionReceipt';
import { Block } from './Block';

export class TransactionService extends EventEmitter {
  private transactions: Map<string, Transaction> = new Map();
  private receipts: Map<string, TransactionReceipt> = new Map();

  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async getTransaction(hash: string): Promise<Transaction | undefined> {
    return this.transactions.get(hash);
  }

  async getTransactionReceipt(hash: string): Promise<TransactionReceipt | undefined> {
    return this.receipts.get(hash);
  }

  async addTransaction(tx: Transaction): Promise<void> {
    this.transactions.set(tx.hash, tx);
    this.emit('newTransaction', tx);
  }

  async addTransactionReceipt(receipt: TransactionReceipt): Promise<void> {
    this.receipts.set(receipt.hash, receipt);
    this.emit('transactionConfirmed', receipt);
  }

  async addBlock(block: Block): Promise<void> {
    for (const tx of block.transactions) {
      await this.addTransaction(tx);
    }
    this.emit('newBlock', block);
  }
}
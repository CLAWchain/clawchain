import { EventEmitter } from 'events';
import { Transaction } from '../Transaction';
import { PeerManager } from './PeerManager';

export class TransactionGossipManager extends EventEmitter {
  private transactionPool: Map<string, Transaction> = new Map();
  private seenTransactions: Set<string> = new Set();

  constructor(private peerManager: PeerManager) {
    super();
  }

  async broadcastTransaction(tx: Transaction): Promise<void> {
    if (this.seenTransactions.has(tx.hash)) {
      return; // Ignore transactions we've already seen
    }

    this.transactionPool.set(tx.hash, tx);
    this.seenTransactions.add(tx.hash);

    await this.peerManager.broadcastTransaction(tx);
    this.emit('transactionBroadcast', tx);
  }

  async processIncomingTransaction(tx: Transaction): Promise<void> {
    if (this.seenTransactions.has(tx.hash)) {
      return; // Ignore transactions we've already seen
    }

    this.transactionPool.set(tx.hash, tx);
    this.seenTransactions.add(tx.hash);
    this.emit('newTransaction', tx);
  }

  async getTransactionPool(): Promise<Transaction[]> {
    return Array.from(this.transactionPool.values());
  }
}
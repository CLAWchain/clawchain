import { EventEmitter } from 'events';
import { Transaction } from '../transaction';
import { PeerManager } from './PeerManager';
import { TransactionGossipProtocol } from './transaction-gossip';

export class TransactionGossipManager extends EventEmitter {
  private transactionPool: Map<string, Transaction> = new Map();
  private seenTransactions: Set<string> = new Set();
  private transactionGossipProtocol: TransactionGossipProtocol;

  constructor(private peerManager: PeerManager) {
    super();
    this.transactionGossipProtocol = new TransactionGossipProtocol(this, this.peerManager.getPeers());
  }

  async broadcastTransaction(tx: Transaction): Promise<void> {
    if (this.seenTransactions.has(tx.hash)) {
      return; // Ignore transactions we've already seen
    }

    this.transactionPool.set(tx.hash, tx);
    this.seenTransactions.add(tx.hash);

    await this.transactionGossipProtocol.broadcastTransaction(tx);
    this.emit('transactionBroadcast', tx);
  }

  async processIncomingTransaction(tx: Transaction): Promise<void> {
    if (this.seenTransactions.has(tx.hash)) {
      return; // Ignore transactions we've already seen
    }

    this.transactionPool.set(tx.hash, tx);
    this.seenTransactions.add(tx.hash);
    this.transactionGossipProtocol.onTransactionReceived(tx);
    this.emit('newTransaction', tx);
  }

  async getTransactionPool(): Promise<Transaction[]> {
    return Array.from(this.transactionPool.values());
  }

  onPeerConnected(peer: any) {
    this.transactionGossipProtocol.onPeerConnected(peer);
  }
}
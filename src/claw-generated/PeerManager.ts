import { EventEmitter } from 'events';
import { Transaction } from './Transaction';
import { TransactionGossipManager } from './network/TransactionGossipManager';

export class PeerManager extends EventEmitter {
  private transactionGossipManager: TransactionGossipManager;

  constructor() {
    super();
    this.transactionGossipManager = new TransactionGossipManager(this);
  }

  async broadcastTransaction(tx: Transaction): Promise<void> {
    // Broadcast the transaction to all connected peers
    for (const peer of this.connectedPeers) {
      await peer.sendTransaction(tx);
    }
  }

  async processIncomingTransaction(tx: Transaction): Promise<void> {
    await this.transactionGossipManager.processIncomingTransaction(tx);
  }

  get connectedPeers(): Peer[] {
    // Return the list of currently connected peers
    return [...this.peers];
  }
}

class Peer {
  async sendTransaction(tx: Transaction): Promise<void> {
    // Send the transaction to this peer
  }
}
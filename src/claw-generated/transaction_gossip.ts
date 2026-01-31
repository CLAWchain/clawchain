import { Transaction } from '../transaction';
import { PeerManager } from '../network/peer_manager';
import { Mempool } from '../mempool';

export class TransactionGossipProtocol {
  private mempool: Mempool;
  private recentlyBroadcasted: Set<string> = new Set();

  constructor(mempool: Mempool) {
    this.mempool = mempool;
  }

  public broadcastTransaction(tx: Transaction) {
    // Check if we've already broadcasted this transaction recently
    if (this.recentlyBroadcasted.has(tx.hash())) {
      return;
    }

    // Add the transaction to the Mempool
    this.mempool.addTransaction(tx);

    // Add the transaction hash to the recently broadcasted set
    this.recentlyBroadcasted.add(tx.hash());

    // Send the transaction to our peers
    PeerManager.getInstance().broadcastTransaction(tx);
  }

  public receivedTransaction(tx: Transaction) {
    // Check if we already have this transaction in our Mempool
    if (this.mempool.has(tx)) {
      return;
    }

    // Add the transaction to the Mempool and broadcast it
    this.broadcastTransaction(tx);
  }
}
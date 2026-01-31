import { TransactionPool } from '../transaction-pool';
import { Peer } from './peer';
import { Transaction } from '../transaction';

class TransactionGossipProtocol {
  private transactionPool: TransactionPool;
  private peers: Peer[];

  constructor(transactionPool: TransactionPool, peers: Peer[]) {
    this.transactionPool = transactionPool;
    this.peers = peers;
  }

  broadcastTransaction(tx: Transaction) {
    // Check if any peers have already seen this transaction
    for (const peer of this.peers) {
      if (!this.transactionPool.hasPeerSeenTransaction(peer.id, tx.hash)) {
        // Send the transaction to the peer
        peer.sendTransaction(tx);

        // Mark the peer as having seen the transaction
        this.transactionPool.markPeerAsSeenTransaction(peer.id, tx.hash);
      }
    }
  }

  onTransactionReceived(tx: Transaction) {
    // Add the transaction to the pool
    this.transactionPool.addTransaction(tx);

    // Broadcast the transaction to all peers
    this.broadcastTransaction(tx);
  }
}

export { TransactionGossipProtocol };
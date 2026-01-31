import { TransactionPool } from '../transaction-pool';
import { PeerManager, PeerInfo } from './PeerManager';

class TransactionGossipProtocol {
  private transactionPool: TransactionPool;
  private peerManager: PeerManager;

  constructor(transactionPool: TransactionPool, peerManager: PeerManager) {
    this.transactionPool = transactionPool;
    this.peerManager = peerManager;
  }

  broadcastTransaction(tx: Transaction) {
    // Add the transaction to the pool
    this.transactionPool.addTransaction(tx);

    // Get the list of peers to send the transaction to
    const peers = this.peerManager.getBestPeers(10);

    // Broadcast the transaction to the peers
    for (const peer of peers) {
      this.sendTransactionToPeer(tx, peer);
    }
  }

  sendTransactionToPeer(tx: Transaction, peer: PeerInfo) {
    // Check if the peer has already received this transaction
    if (this.transactionPool.hasPeerSeenTransaction(peer.id, tx.hash)) {
      return;
    }

    // Mark the peer as having seen the transaction
    this.transactionPool.markPeerAsSeenTransaction(peer.id, tx.hash);

    // Send the transaction to the peer
    peer.sendTransaction(tx);
  }

  receivedTransaction(tx: Transaction, peerId: string) {
    // Add the transaction to the pool
    this.transactionPool.addTransaction(tx);

    // Mark the peer as having seen the transaction
    this.transactionPool.markPeerAsSeenTransaction(peerId, tx.hash);

    // Broadcast the transaction to other peers
    this.broadcastTransaction(tx);
  }
}

export { TransactionGossipProtocol };
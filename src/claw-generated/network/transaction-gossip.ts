import { TransactionPool } from '../transaction-pool';
import { Peer } from './peer';
import { Transaction } from '../transaction';
import { BloomFilter } from '../bloom-filter';

class TransactionGossipProtocol {
  private transactionPool: TransactionPool;
  private peers: Peer[];
  private transactionFilter: BloomFilter;

  constructor(transactionPool: TransactionPool, peers: Peer[]) {
    this.transactionPool = transactionPool;
    this.peers = peers;
    this.transactionFilter = new BloomFilter();
  }

  broadcastTransaction(tx: Transaction) {
    // Check if the transaction has already been seen
    if (this.transactionFilter.has(tx.hash)) {
      return;
    }

    // Add the transaction to the filter
    this.transactionFilter.add(tx.hash);

    // Send the transaction to all peers
    for (const peer of this.peers) {
      peer.sendTransaction(tx);
    }
  }

  onTransactionReceived(tx: Transaction) {
    // Add the transaction to the pool
    this.transactionPool.addTransaction(tx);

    // Broadcast the transaction to all peers
    this.broadcastTransaction(tx);
  }

  onPeerConnected(peer: Peer) {
    // Send all transactions in the pool to the new peer
    for (const tx of this.transactionPool.getTransactions()) {
      peer.sendTransaction(tx);
    }
  }
}

export { TransactionGossipProtocol };
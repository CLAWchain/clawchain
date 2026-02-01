import { Transaction } from '../transactions/transaction';
import { Peer } from '../networking/peer';
import { MemPool } from '../mempool/mempool';

class TransactionGossip {
  private memPool: MemPool;
  private peers: Peer[];
  private transactionHistory: Map<string, Set<Peer>>;

  constructor(memPool: MemPool, peers: Peer[]) {
    this.memPool = memPool;
    this.peers = peers;
    this.transactionHistory = new Map();
  }

  /**
   * Broadcast a new transaction to relevant peers.
   * @param tx The new transaction to broadcast.
   */
  broadcastTransaction(tx: Transaction): void {
    // Check if we've already sent this transaction to each peer
    const peersToSend = this.getPeersToSendTransaction(tx);

    // Send the transaction to the selected peers
    for (const peer of peersToSend) {
      peer.sendTransaction(tx);
      this.addTransactionHistory(tx, peer);
    }
  }

  /**
   * Get the list of peers that have not yet received a given transaction.
   * @param tx The transaction to check.
   * @returns The list of peers to send the transaction to.
   */
  private getPeersToSendTransaction(tx: Transaction): Peer[] {
    const txId = tx.getId();
    const peersWithTx = this.transactionHistory.get(txId) || new Set();
    return this.peers.filter(peer => !peersWithTx.has(peer));
  }

  /**
   * Add a transaction to the history, tracking which peers have received it.
   * @param tx The transaction to add to the history.
   * @param peer The peer that received the transaction.
   */
  private addTransactionHistory(tx: Transaction, peer: Peer): void {
    const txId = tx.getId();
    if (!this.transactionHistory.has(txId)) {
      this.transactionHistory.set(txId, new Set());
    }
    this.transactionHistory.get(txId)!.add(peer);
  }

  /**
   * Handle an incoming transaction from a peer.
   * @param tx The incoming transaction.
   * @param peer The peer that sent the transaction.
   */
  handleIncomingTransaction(tx: Transaction, peer: Peer): void {
    // Check if we already have the transaction in our mempool
    if (this.memPool.has(tx)) {
      return;
    }

    // Add the transaction to our mempool
    this.memPool.add(tx);

    // Broadcast the transaction to our other peers
    this.broadcastTransaction(tx);
  }
}

export { TransactionGossip };
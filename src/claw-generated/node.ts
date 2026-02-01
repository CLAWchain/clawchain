import { MemPool } from '../mempool/mempool';
import { Peer } from '../networking/peer';
import { TransactionGossip } from './transaction_gossip';
import { Transaction } from '../transactions/transaction';

class Node {
  private memPool: MemPool;
  private peers: Peer[];
  private transactionGossip: TransactionGossip;

  constructor() {
    this.memPool = new MemPool();
    this.peers = [];
    this.transactionGossip = new TransactionGossip(this.memPool, this.peers);
  }

  /**
   * Add a new transaction to the mempool and broadcast it to peers.
   * @param tx The new transaction.
   */
  addTransaction(tx: Transaction): void {
    this.memPool.add(tx);
    this.transactionGossip.broadcastTransaction(tx);
  }

  /**
   * Handle an incoming transaction from a peer.
   * @param tx The incoming transaction.
   * @param peer The peer that sent the transaction.
   */
  handleIncomingTransaction(tx: Transaction, peer: Peer): void {
    this.transactionGossip.handleIncomingTransaction(tx, peer);
  }

  /**
   * Add a new peer to the node's peer list.
   * @param peer The new peer to add.
   */
  addPeer(peer: Peer): void {
    this.peers.push(peer);
    this.transactionGossip.peers.push(peer);
  }
}

export { Node };
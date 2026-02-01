import { TransactionMempool } from './transaction_mempool';
import { Peer } from '../networking/peer';
import { Transaction } from '../transaction';

class TransactionGossipProtocol {
  private mempool: TransactionMempool;
  private peers: Peer[];

  constructor(mempool: TransactionMempool) {
    this.mempool = mempool;
    this.peers = [];
  }

  addPeer(peer: Peer): void {
    this.peers.push(peer);
  }

  removePeer(peer: Peer): void {
    this.peers = this.peers.filter(p => p !== peer);
  }

  broadcastTransaction(tx: Transaction): void {
    const txHash = tx.hash();
    this.mempool.addTransaction(tx);

    for (const peer of this.peers) {
      if (!peer.hasTransaction(txHash)) {
        peer.sendTransaction(tx);
        peer.addTransaction(txHash);
      }
    }
  }

  handleTransactionRequest(peer: Peer, txHash: string): void {
    const tx = this.mempool.getTransaction(txHash);
    if (tx) {
      peer.sendTransaction(tx);
    }
  }
}

export { TransactionGossipProtocol };
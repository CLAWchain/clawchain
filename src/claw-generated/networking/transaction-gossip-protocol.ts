import { TransactionMempool } from '../transaction_mempool';
import { Peer } from './peer';
import { Transaction } from '../transaction';

class TransactionGossipProtocol {
  private mempool: TransactionMempool;
  private peers: Peer[];
  private knownTransactions: Map<string, Set<Peer>>;

  constructor(mempool: TransactionMempool) {
    this.mempool = mempool;
    this.peers = [];
    this.knownTransactions = new Map();
  }

  addPeer(peer: Peer): void {
    this.peers.push(peer);
  }

  removePeer(peer: Peer): void {
    this.peers = this.peers.filter(p => p !== peer);
    this.knownTransactions.forEach((peerSet, txHash) => {
      peerSet.delete(peer);
      if (peerSet.size === 0) {
        this.knownTransactions.delete(txHash);
      }
    });
  }

  broadcastTransaction(tx: Transaction): void {
    const txHash = tx.hash();
    this.mempool.addTransaction(tx);

    if (!this.knownTransactions.has(txHash)) {
      this.knownTransactions.set(txHash, new Set());
    }

    for (const peer of this.peers) {
      if (!this.knownTransactions.get(txHash)?.has(peer)) {
        peer.sendTransaction(tx);
        this.knownTransactions.get(txHash)?.add(peer);
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
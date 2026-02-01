import { Transaction } from '../types';
import { PeerManager } from './peer_manager';

export class TransactionGossip {
  private mempool: Map<string, Transaction> = new Map();
  private peerManager: PeerManager;

  constructor(peerManager: PeerManager) {
    this.peerManager = peerManager;
  }

  addTransaction(tx: Transaction): void {
    const txHash = tx.hash();
    if (!this.mempool.has(txHash)) {
      this.mempool.set(txHash, tx);
      this.broadcastTransaction(tx);
    }
  }

  broadcastTransaction(tx: Transaction): void {
    const peers = this.peerManager.getPeers();
    for (const peer of peers) {
      peer.sendTransaction(tx);
    }
  }
}
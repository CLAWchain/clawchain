import { Peer } from './peer';
import { TransactionMempool } from './transaction_mempool';
import { TransactionGossipProtocol } from './transaction_gossip_protocol';

class P2PNetwork {
  private peers: Peer[];
  private mempool: TransactionMempool;
  private gossipProtocol: TransactionGossipProtocol;

  constructor() {
    this.peers = [];
    this.mempool = new TransactionMempool();
    this.gossipProtocol = new TransactionGossipProtocol(this.mempool);
  }

  addPeer(peer: Peer): void {
    this.peers.push(peer);
    this.gossipProtocol.addPeer(peer);
  }

  removePeer(peer: Peer): void {
    this.peers = this.peers.filter(p => p !== peer);
    this.gossipProtocol.removePeer(peer);
  }

  broadcastTransaction(tx: Transaction): void {
    this.gossipProtocol.broadcastTransaction(tx);
  }

  handleTransactionRequest(peer: Peer, txHash: string): void {
    this.gossipProtocol.handleTransactionRequest(peer, txHash);
  }
}

export { P2PNetwork };
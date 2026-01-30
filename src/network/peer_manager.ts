import { Peer } from './peer';

export class PeerManager {
  private peers: Peer[] = [];

  addPeer(peer: Peer) {
    this.peers.push(peer);
  }

  removePeer(peer: Peer) {
    this.peers = this.peers.filter(p => p.id !== peer.id);
  }

  getPeers(): Peer[] {
    return this.peers;
  }
}
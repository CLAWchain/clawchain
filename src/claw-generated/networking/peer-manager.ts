import { PeerInfo } from './peer-info';

export class PeerManager {
  peers: PeerInfo[] = [];

  start() {
    // Implement peer discovery and connection management
    console.log('PeerManager started');
  }

  addPeer(peerInfo: PeerInfo) {
    this.peers.push(peerInfo);
  }

  removePeer(peerInfo: PeerInfo) {
    this.peers = this.peers.filter(p => p.id !== peerInfo.id);
  }
}
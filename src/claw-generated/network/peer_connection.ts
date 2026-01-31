import { PeerManager } from './peer_manager';
import { PeerInfo } from './peer_info';

export class PeerConnection {
  private peerManager: PeerManager;

  constructor(peerManager: PeerManager) {
    this.peerManager = peerManager;
  }

  connectToPeer(peerInfo: PeerInfo) {
    // Implement peer connection logic here
    this.peerManager.addPeer(peerInfo);
  }

  disconnectFromPeer(peerId: string) {
    this.peerManager.removePeer(peerId);
  }

  getBestPeers(): PeerInfo[] {
    return this.peerManager.getPeersByReputation();
  }
}
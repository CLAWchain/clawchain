import { PeerManager } from './peer_manager';
import { PeerInfo } from './peer_info';

export class PeerReputation {
  private peerManager: PeerManager;

  constructor(peerManager: PeerManager) {
    this.peerManager = peerManager;
  }

  onValidTransactionReceived(peerId: string) {
    this.peerManager.updatePeerReputation(peerId, 10);
  }

  onInvalidTransactionReceived(peerId: string) {
    this.peerManager.updatePeerReputation(peerId, -20);
  }

  onValidBlockReceived(peerId: string) {
    this.peerManager.updatePeerReputation(peerId, 20);
  }

  onInvalidBlockReceived(peerId: string) {
    this.peerManager.updatePeerReputation(peerId, -30);
  }
}
import { ReputationManager } from './reputation-manager';
import { PeerInfo } from './types';

export class PeerSelector {
  private reputationManager: ReputationManager;

  constructor(reputationManager: ReputationManager) {
    this.reputationManager = reputationManager;
  }

  selectPeers(count: number): PeerInfo[] {
    // Get all peers, excluding banned peers
    const peers = [...this.reputationManager.peers.values()]
      .filter((peer) => !peer.isBanned())
      .sort((a, b) => b.reputation - a.reputation);

    // Select the top `count` peers
    return peers.slice(0, count).map((peer) => peer.info);
  }

  banPeer(peerId: string) {
    const peer = this.reputationManager.getPeer(peerId);
    if (peer) {
      peer.updateReputation(-100);
    }
  }
}
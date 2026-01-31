import { PeerInfo } from './peer_info';

export class PeerManager {
  private peers: Map<string, PeerInfo> = new Map();
  private reputationThreshold = 50;

  addPeer(peerInfo: PeerInfo) {
    this.peers.set(peerInfo.id, peerInfo);
    peerInfo.reputationScore = 100; // Start with full reputation
  }

  removePeer(peerId: string) {
    this.peers.delete(peerId);
  }

  getPeer(peerId: string): PeerInfo | undefined {
    return this.peers.get(peerId);
  }

  updatePeerReputation(peerId: string, delta: number) {
    const peerInfo = this.getPeer(peerId);
    if (peerInfo) {
      peerInfo.reputationScore = Math.max(0, peerInfo.reputationScore + delta);
      if (peerInfo.reputationScore < this.reputationThreshold) {
        this.removePeer(peerId);
        console.log(`Banned peer ${peerId} due to low reputation`);
      }
    }
  }

  getPeersByReputation(): PeerInfo[] {
    return Array.from(this.peers.values())
      .sort((a, b) => b.reputationScore - a.reputationScore);
  }
}
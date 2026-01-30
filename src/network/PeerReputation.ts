import { PeerId } from './PeerManager';

export class PeerReputation {
  private reputationScores: Map<PeerId, number> = new Map();
  private bannedPeers: Set<PeerId> = new Set();
  private reputationThreshold = 50;
  private banDuration = 3600; // 1 hour

  reportGoodBehavior(peerId: PeerId) {
    this.updateReputation(peerId, 10);
  }

  reportBadBehavior(peerId: PeerId) {
    this.updateReputation(peerId, -20);
    if (this.getReputation(peerId) < this.reputationThreshold) {
      this.banPeer(peerId);
    }
  }

  private updateReputation(peerId: PeerId, delta: number) {
    let reputation = this.getReputation(peerId);
    reputation = Math.max(0, reputation + delta);
    this.reputationScores.set(peerId, reputation);
  }

  private getReputation(peerId: PeerId): number {
    return this.reputationScores.get(peerId) || 100;
  }

  private banPeer(peerId: PeerId) {
    this.bannedPeers.add(peerId);
    setTimeout(() => this.unbanPeer(peerId), this.banDuration * 1000);
  }

  private unbanPeer(peerId: PeerId) {
    this.bannedPeers.delete(peerId);
  }

  isBanned(peerId: PeerId): boolean {
    return this.bannedPeers.has(peerId);
  }
}
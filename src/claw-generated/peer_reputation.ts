import { PeerInfo } from '../network/peer';

export class PeerReputation {
  private peerScores: Map<string, number> = new Map();
  private bannedPeers: Set<string> = new Set();

  addPeerScore(peerId: string, score: number) {
    if (this.peerScores.has(peerId)) {
      this.peerScores.set(peerId, this.peerScores.get(peerId)! + score);
    } else {
      this.peerScores.set(peerId, score);
    }

    if (this.peerScores.get(peerId)! < -100) {
      this.banPeer(peerId);
    }
  }

  banPeer(peerId: string) {
    this.bannedPeers.add(peerId);
  }

  isBanned(peerId: string): boolean {
    return this.bannedPeers.has(peerId);
  }

  getPeerScore(peerId: string): number {
    return this.peerScores.get(peerId) || 0;
  }

  getPeerList(): PeerInfo[] {
    return Array.from(this.peerScores.entries())
      .filter(([peerId]) => !this.isBanned(peerId))
      .map(([peerId, score]) => ({ id: peerId, score }));
  }
}
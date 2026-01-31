import { PeerInfo } from './peer_info';

export class PeerReputation {
  private peerReputations: Map<string, number> = new Map();
  private reputationThreshold = 0.5;

  addPeer(peer: PeerInfo) {
    this.peerReputations.set(peer.id, 1.0);
  }

  removePeer(peer: PeerInfo) {
    this.peerReputations.delete(peer.id);
  }

  updateReputation(peer: PeerInfo, score: number) {
    this.peerReputations.set(peer.id, score);
  }

  isBanned(peer: PeerInfo): boolean {
    return this.peerReputations.get(peer.id) < this.reputationThreshold;
  }

  getPeerReputation(peer: PeerInfo): number {
    return this.peerReputations.get(peer.id) || 1.0;
  }
}
import { PeerInfo } from './PeerManager';

class PeerReputation {
  private peerReputations: Map<string, number> = new Map();

  constructor() {
    // Initialize peer reputations
  }

  addPeer(peerInfo: PeerInfo) {
    // Add new peer with default reputation
    this.peerReputations.set(peerInfo.id, 100);
  }

  updateReputation(peerId: string, delta: number) {
    // Update reputation score for a peer
    const currentReputation = this.peerReputations.get(peerId) || 100;
    const newReputation = Math.max(0, currentReputation + delta);
    this.peerReputations.set(peerId, newReputation);
  }

  getPeerReputation(peerId: string): number {
    // Get the current reputation score for a peer
    return this.peerReputations.get(peerId) || 100;
  }

  getBestPeers(count: number): PeerInfo[] {
    // Return the top `count` peers by reputation
    const sortedPeers = Array.from(this.peerReputations.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([id]) => this.getPeerInfo(id));
    return sortedPeers.slice(0, count);
  }

  private getPeerInfo(peerId: string): PeerInfo {
    // Retrieve the PeerInfo object for a given peer ID
    // (this would be provided by the PeerManager class)
    return { id: peerId, reputation: this.getPeerReputation(peerId) };
  }
}

export { PeerReputation };
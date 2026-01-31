import { PeerReputation } from './PeerReputation';

class PeerManager {
  private peerReputation: PeerReputation;

  constructor() {
    this.peerReputation = new PeerReputation();
  }

  addPeer(peerInfo: PeerInfo) {
    // Add a new peer to the network
    this.peerReputation.addPeer(peerInfo);
  }

  updatePeerReputation(peerId: string, delta: number) {
    // Update the reputation score for a peer
    this.peerReputation.updateReputation(peerId, delta);
  }

  getPeerReputation(peerId: string): number {
    // Get the current reputation score for a peer
    return this.peerReputation.getPeerReputation(peerId);
  }

  getBestPeers(count: number): PeerInfo[] {
    // Return the top `count` peers by reputation
    return this.peerReputation.getBestPeers(count);
  }
}

export interface PeerInfo {
  id: string;
  reputation: number;
}

export { PeerManager };
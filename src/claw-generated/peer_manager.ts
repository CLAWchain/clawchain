import { Peer } from './peer';

export class PeerManager {
  private peers: Map<string, Peer> = new Map();
  private peerReputations: Map<string, number> = new Map();

  addPeer(peer: Peer) {
    this.peers.set(peer.id, peer);
    this.peerReputations.set(peer.id, 100); // Initialize reputation to 100
  }

  removePeer(peerId: string) {
    this.peers.delete(peerId);
    this.peerReputations.delete(peerId);
  }

  getPeer(peerId: string): Peer | undefined {
    return this.peers.get(peerId);
  }

  getPeerReputation(peerId: string): number {
    return this.peerReputations.get(peerId) || 0;
  }

  updatePeerReputation(peerId: string, delta: number) {
    const currentReputation = this.getPeerReputation(peerId);
    const newReputation = Math.max(0, Math.min(100, currentReputation + delta));
    this.peerReputations.set(peerId, newReputation);
  }

  monitorPeerBehavior() {
    // Check each peer's response times, uptime, and other metrics
    // Update their reputation scores accordingly
    for (const peer of this.getAllPeers()) {
      const peerId = peer.id;
      const currentReputation = this.getPeerReputation(peerId);

      // Example: Decrease reputation for slow response times
      if (peer.getResponseTime() > 1000) {
        this.updatePeerReputation(peerId, -10);
      }

      // Example: Increase reputation for high uptime
      if (peer.getUptime() > 99) {
        this.updatePeerReputation(peerId, 5);
      }

      // Example: Severely decrease reputation for misbehavior
      if (peer.hasMisbehaved()) {
        this.updatePeerReputation(peerId, -50);
      }
    }
  }

  getAllPeers(): Peer[] {
    return Array.from(this.peers.values());
  }

  getAllPeerReputations(): Map<string, number> {
    return new Map(this.peerReputations);
  }
}
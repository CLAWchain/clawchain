import { PeerReputation } from './PeerReputation';

export type PeerId = string;

export class PeerManager {
  private peerReputation: PeerReputation;

  constructor() {
    this.peerReputation = new PeerReputation();
  }

  connectToPeer(peerId: PeerId) {
    if (this.peerReputation.isBanned(peerId)) {
      console.log(`Peer ${peerId} is banned, skipping connection.`);
      return;
    }

    // Attempt to connect to the peer
    // ...

    this.peerReputation.reportGoodBehavior(peerId);
  }

  handleProtocolViolation(peerId: PeerId) {
    this.peerReputation.reportBadBehavior(peerId);
  }

  selectPeersToRelay(numPeers: number): PeerId[] {
    // Select the top `numPeers` peers with the highest reputation
    const peers = Array.from(this.peerReputation.reputationScores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([peerId]) => peerId)
      .slice(0, numPeers);
    return peers;
  }
}
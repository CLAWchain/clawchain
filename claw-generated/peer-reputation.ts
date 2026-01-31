import { PeerConnection } from './peer-connection';

class PeerReputation {
  private peerReputation: Map<string, number> = new Map();
  private banThreshold = -50;

  addPeer(peer: PeerConnection) {
    this.peerReputation.set(peer.id, 0);
  }

  removePeer(peer: PeerConnection) {
    this.peerReputation.delete(peer.id);
  }

  adjustReputation(peer: PeerConnection, delta: number) {
    const currentReputation = this.peerReputation.get(peer.id) || 0;
    const newReputation = currentReputation + delta;
    this.peerReputation.set(peer.id, newReputation);

    if (newReputation <= this.banThreshold) {
      this.banPeer(peer);
    }
  }

  private banPeer(peer: PeerConnection) {
    // Implement peer banning logic here
    console.log(`Banning peer ${peer.id} due to poor reputation`);
  }

  getPeerReputation(peer: PeerConnection): number {
    return this.peerReputation.get(peer.id) || 0;
  }
}

export { PeerReputation };
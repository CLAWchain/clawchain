import { PeerInfo, PeerManager } from './types';

export class PeerManagerImpl implements PeerManager {
  private peers: Map<string, PeerInfo> = new Map();
  private readonly REPUTATION_THRESHOLD = 0.5;

  addPeer(peer: PeerInfo): void {
    this.peers.set(peer.id, peer);
  }

  removePeer(peerId: string): void {
    this.peers.delete(peerId);
  }

  getPeerById(peerId: string): PeerInfo | undefined {
    return this.peers.get(peerId);
  }

  getAllPeers(): PeerInfo[] {
    return Array.from(this.peers.values());
  }

  updatePeerReputation(peerId: string, delta: number): void {
    const peer = this.getPeerById(peerId);
    if (peer) {
      peer.reputation += delta;
      if (peer.reputation < this.REPUTATION_THRESHOLD) {
        this.banPeer(peerId);
      }
    }
  }

  banPeer(peerId: string): void {
    this.removePeer(peerId);
    // Implement logic to disconnect and prevent reconnection of banned peers
  }
}
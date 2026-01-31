import { PeerReputation } from './peer_reputation';

export interface PeerInfo {
  id: string;
  score: number;
}

export class PeerManager {
  private peerReputation: PeerReputation;

  constructor() {
    this.peerReputation = new PeerReputation();
  }

  addPeerScore(peerId: string, score: number) {
    this.peerReputation.addPeerScore(peerId, score);
  }

  banPeer(peerId: string) {
    this.peerReputation.banPeer(peerId);
  }

  isBanned(peerId: string): boolean {
    return this.peerReputation.isBanned(peerId);
  }

  getPeerScore(peerId: string): number {
    return this.peerReputation.getPeerScore(peerId);
  }

  getPeerList(): PeerInfo[] {
    return this.peerReputation.getPeerList();
  }
}
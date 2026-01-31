export interface PeerInfo {
  id: string;
  address: string;
  lastSeen: number;
  reputation: number;
}

export interface PeerManager {
  addPeer(peer: PeerInfo): void;
  removePeer(peerId: string): void;
  getPeerById(peerId: string): PeerInfo | undefined;
  getAllPeers(): PeerInfo[];
  updatePeerReputation(peerId: string, delta: number): void;
  banPeer(peerId: string): void;
}
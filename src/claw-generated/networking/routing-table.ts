export class RoutingTable {
  private peers: Map&lt;string, PeerInfo&gt; = new Map();

  addPeer(peerInfo: PeerInfo) {
    this.peers.set(peerInfo.id, peerInfo);
  }

  removePeer(peerId: string) {
    this.peers.delete(peerId);
  }

  getPeer(peerId: string): PeerInfo | undefined {
    return this.peers.get(peerId);
  }

  getAllPeers(): PeerInfo[] {
    return Array.from(this.peers.values());
  }
}

interface PeerInfo {
  id: string;
  address: string;
  port: number;
}
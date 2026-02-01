import { NetworkManager } from './network';
import { Peer } from './peer';

export class Node {
  private networkManager: NetworkManager;

  constructor() {
    this.networkManager = new NetworkManager();
  }

  connectToPeer(address: string) {
    const peer = new Peer(address, address);
    this.networkManager.addPeer(peer);
  }

  handleMessage(peerId: string, message: any) {
    const peer = this.networkManager.getPeer(peerId);
    if (peer) {
      // Handle the message
      this.networkManager.reportGoodPeerBehavior(peerId);
    } else {
      // Peer not found, possibly a malicious actor
      this.networkManager.banPeer(peerId);
    }
  }
}
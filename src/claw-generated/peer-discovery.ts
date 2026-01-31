import { KademliaDHT, KademliaNode } from './kademlia';
import { NetworkManager } from './network-manager';

export class PeerDiscovery {
  private dht: KademliaDHT;
  private networkManager: NetworkManager;

  constructor(networkManager: NetworkManager) {
    this.networkManager = networkManager;
    this.dht = new KademliaDHT();
  }

  start(bootstrapNodes: KademliaNode[]) {
    this.dht.bootstrap(bootstrapNodes);
    this.maintainDHT();
  }

  private maintainDHT() {
    // Periodically maintain the DHT
    setInterval(() => {
      this.dht.maintain();
    }, 60000); // 1 minute
  }

  findPeers(target: string): KademliaNode[] {
    return this.dht.lookup(target);
  }

  connectToPeers(peers: KademliaNode[]) {
    for (const peer of peers) {
      this.networkManager.connectToPeer(peer.address);
    }
  }
}
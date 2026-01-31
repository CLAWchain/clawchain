import { kademlia, KademliaNode, KademliaConfig } from 'kademlia-dht';

const config: KademliaConfig = {
  bucketSize: 20,
  alpha: 3,
  refreshInterval: 3600000, // 1 hour
  timeoutSeconds: 5,
  bootstrapNodes: [
    'bootstrap1.clawchain.com:30303',
    'bootstrap2.clawchain.com:30303'
  ]
};

export class PeerDiscovery {
  private node: KademliaNode;

  constructor() {
    this.node = kademlia(config);
  }

  start() {
    this.node.listen();
    console.log('Peer discovery started');
  }

  findPeers(count: number): Promise<string[]> {
    return this.node.findRandomNodes(count);
  }

  addPeer(address: string): Promise<void> {
    return this.node.addContact(address);
  }
}
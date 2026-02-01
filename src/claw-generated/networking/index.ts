import { KademliaNode } from './kademlia';
import { NodeId, Message } from './types';

class NetworkManager {
  kademliaNode: KademliaNode;

  constructor(nodeId: NodeId) {
    this.kademliaNode = new KademliaNode(nodeId);
  }

  joinNetwork(bootstrapNodes: NodeId[]) {
    this.kademliaNode.joinNetwork(bootstrapNodes);
  }

  findNode(targetId: NodeId): NodeId[] {
    return this.kademliaNode.findNode(targetId);
  }

  storeData(key: string, value: any) {
    this.kademliaNode.storeData(key, value);
  }

  retrieveData(key: string): any {
    return this.kademliaNode.retrieveData(key);
  }

  handleMessage(message: Message) {
    this.kademliaNode.handleMessage(message);
  }
}

export { NetworkManager };
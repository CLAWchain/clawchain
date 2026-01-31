import { NodeId, Node, Message, RoutingTable } from './types';

class KademliaNode implements Node {
  id: NodeId;
  routingTable: RoutingTable;
  bootstrapNodes: Node[];

  constructor(id: NodeId, bootstrapNodes: Node[]) {
    this.id = id;
    this.routingTable = new RoutingTable(this.id);
    this.bootstrapNodes = bootstrapNodes;
  }

  handleMessage(message: Message): void {
    // Handle incoming messages and update routing table
    console.log(`Received message from ${message.sender}: ${message.type}`);
    this.routingTable.addNode({
      id: message.sender,
      handleMessage: (msg) => this.handleMessage(msg),
      findNode: (target) => this.findNode(target),
      store: (key, value) => this.store(key, value),
      retrieve: (key) => this.retrieve(key)
    });
  }

  findNode(target: NodeId): Node[] {
    // Implement Kademlia node lookup
    return this.routingTable.getClosestNodes(target, 3);
  }

  store(key: string, value: any): void {
    // Implement Kademlia data storage
    console.log(`Storing key ${key} with value ${value}`);
  }

  retrieve(key: string): any {
    // Implement Kademlia data retrieval
    console.log(`Retrieving key ${key}`);
    return null;
  }

  joinNetwork(): void {
    // Join the network using bootstrap nodes
    for (const node of this.bootstrapNodes) {
      node.handleMessage({
        sender: this.id,
        type: 'JOIN_REQUEST',
        payload: {}
      });
    }
  }

  leaveNetwork(): void {
    // Leave the network by notifying other nodes
    for (const node of this.routingTable.getNodes()) {
      node.handleMessage({
        sender: this.id,
        type: 'LEAVE_NETWORK',
        payload: {}
      });
    }
  }
}

export { KademliaNode };
// Kademlia-based peer discovery protocol for ClawChain

import { NodeId, RoutingTable, Message, MessageType } from './types';
import { Network } from './network';

class KademliaNode {
  nodeId: NodeId;
  routingTable: RoutingTable;
  network: Network;

  constructor(nodeId: NodeId, network: Network) {
    this.nodeId = nodeId;
    this.routingTable = new RoutingTable(nodeId);
    this.network = network;
  }

  joinNetwork(bootstrapNodes: NodeId[]) {
    // Connect to bootstrap nodes and populate routing table
    for (const node of bootstrapNodes) {
      this.network.connectToNode(node);
      this.routingTable.addNode(node);
    }
  }

  findNode(targetId: NodeId): NodeId[] {
    // Query routing table and network to find closest nodes to target
    const closestNodes = this.routingTable.findClosestNodes(targetId);
    if (closestNodes.length === 0) {
      // Query network for more nodes
      const foundNodes = this.network.findNodes(targetId);
      this.routingTable.addNodes(foundNodes);
      return foundNodes;
    }
    return closestNodes;
  }

  storeData(key: string, value: any) {
    // Store key-value pair in DHT
    this.network.storeData(key, value);
  }

  retrieveData(key: string): any {
    // Retrieve value from DHT
    return this.network.retrieveData(key);
  }

  handleMessage(message: Message) {
    // Process incoming messages (PING, FIND_NODE, STORE, RETRIEVE, etc.)
    switch (message.type) {
      case MessageType.PING:
        this.handlePing(message);
        break;
      case MessageType.FIND_NODE:
        this.handleFindNode(message);
        break;
      case MessageType.STORE:
        this.handleStore(message);
        break;
      case MessageType.RETRIEVE:
        this.handleRetrieve(message);
        break;
    }
  }

  private handlePing(message: Message) {
    // Update routing table and respond to ping
    this.routingTable.addNode(message.sender);
    this.network.sendMessage({
      type: MessageType.PING,
      sender: this.nodeId,
      target: message.sender
    });
  }

  private handleFindNode(message: Message) {
    // Find closest nodes and respond with their IDs
    const closestNodes = this.findNode(message.target!);
    this.network.sendMessage({
      type: MessageType.FIND_NODE,
      sender: this.nodeId,
      target: message.sender,
      value: closestNodes
    });
  }

  private handleStore(message: Message) {
    // Store the key-value pair in the DHT
    this.storeData(message.key!, message.value!);
  }

  private handleRetrieve(message: Message) {
    // Retrieve the value from the DHT and respond
    const value = this.retrieveData(message.key!);
    this.network.sendMessage({
      type: MessageType.RETRIEVE,
      sender: this.nodeId,
      target: message.sender,
      value: value
    });
  }
}

export { KademliaNode };
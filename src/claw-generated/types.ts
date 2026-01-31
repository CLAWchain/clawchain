export type NodeId = string;

export interface Node {
  id: NodeId;
  handleMessage(message: Message): void;
  findNode(target: NodeId): Node[];
  store(key: string, value: any): void;
  retrieve(key: string): any;
}

export interface Message {
  sender: NodeId;
  type: string;
  payload: any;
}

export class RoutingTable {
  private nodes: Map<NodeId, Node>;
  private ownId: NodeId;

  constructor(ownId: NodeId) {
    this.ownId = ownId;
    this.nodes = new Map();
  }

  addNode(node: Node): void {
    this.nodes.set(node.id, node);
  }

  removeNode(nodeId: NodeId): void {
    this.nodes.delete(nodeId);
  }

  getClosestNodes(target: NodeId, count: number): Node[] {
    // Implement Kademlia distance calculation and sorting
    const nodeIds = Array.from(this.nodes.keys());
    nodeIds.sort((a, b) => this.distance(a, target) - this.distance(b, target));
    return nodeIds.slice(0, count).map(id => this.nodes.get(id)!);
  }

  private distance(a: NodeId, b: NodeId): number {
    // Implement XOR distance calculation
    const aNum = parseInt(a, 16);
    const bNum = parseInt(b, 16);
    return aNum ^ bNum;
  }
}
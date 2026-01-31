import { Node } from './node';

export class RoutingTable {
  private table: Map<string, Node>;

  constructor() {
    this.table = new Map();
  }

  addNode(node: Node): void {
    this.table.set(node.id, node);
  }

  getNode(id: string): Node | undefined {
    return this.table.get(id);
  }

  removeNode(id: string): void {
    this.table.delete(id);
  }

  getAllNodes(): Node[] {
    return Array.from(this.table.values());
  }
}
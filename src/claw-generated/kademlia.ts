import { Node } from './node';
import { RoutingTable } from './routing-table';
import { NetworkClient } from './network-client';

export class Kademlia {
  routingTable: RoutingTable;
  networkClient: NetworkClient;

  constructor(networkClient: NetworkClient) {
    this.routingTable = new RoutingTable();
    this.networkClient = networkClient;
  }

  async lookup(targetId: string): Promise<Node[]> {
    let closestNodes = this.routingTable.findClosestNodes(targetId, 3);
    let result: Node[] = [];

    while (closestNodes.length > 0 && result.length < 3) {
      let lookupResults = await Promise.all(closestNodes.map(node => this.lookupNode(node, targetId)));
      result = result.concat(lookupResults.flatMap(r => r));
      closestNodes = this.routingTable.findClosestNodes(targetId, 3);
    }

    return result;
  }

  private async lookupNode(node: Node, targetId: string): Promise<Node[]> {
    let response = await this.networkClient.sendFindNodeRequest(node, targetId);
    response.nodes.forEach(n => this.routingTable.addNode(n));
    return response.nodes;
  }
}
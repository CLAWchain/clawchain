export type NodeId = string;

export interface RoutingTable {
  nodes: NodeId[];
  distances: Map<NodeId, number>;
}

export enum MessageType {
  PING,
  FIND_NODE,
  STORE,
  RETRIEVE
}

export interface Message {
  type: MessageType;
  sender: NodeId;
  target?: NodeId;
  key?: string;
  value?: any;
}
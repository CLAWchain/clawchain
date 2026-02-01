export enum MessageType {
  FIND_NODE = 'FIND_NODE',
  STORE = 'STORE',
  RETRIEVE = 'RETRIEVE',
  BLOCK = 'BLOCK' // New message type for block propagation
}

export interface Message {
  type: MessageType;
  sender: NodeId;
  target?: NodeId;
  key?: string;
  value?: any;
  block?: Block; // Include the block data for the BLOCK message type
}

export type NodeId = string;
export interface Block {
  // Block data structure
  hash: string;
  height: number;
  timestamp: number;
  transactions: Transaction[];
  // Other block properties
}

export interface Transaction {
  // Transaction data structure
  hash: string;
  from: string;
  to: string;
  value: number;
  // Other transaction properties
}
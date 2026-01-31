import { keccak256 } from 'js-sha3';

export enum NodeType {
  BRANCH = 'branch',
  EXTENSION = 'extension',
  LEAF = 'leaf',
}

export interface TrieNode {
  type: NodeType;
  key: Uint8Array;
  value: Uint8Array | null;
  children: Map<Uint8Array, TrieNode>;
}

export function createNode(type: NodeType, key: Uint8Array, value: Uint8Array | null): TrieNode {
  return {
    type,
    key,
    value,
    children: new Map(),
  };
}

export function hash(data: Uint8Array): Uint8Array {
  return new Uint8Array(keccak256.arrayBuffer(data));
}
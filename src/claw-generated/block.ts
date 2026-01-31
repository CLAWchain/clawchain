import { Transaction } from './transaction';
import { MerkleTree } from './merkle-tree';
import { sha256 } from 'js-sha256';

export class Block {
  version: number;
  timestamp: number;
  previousHash: string;
  transactions: Transaction[];
  merkleRoot: string;
  nonce: number;
  hash: string;

  constructor(
    version: number,
    timestamp: number,
    previousHash: string,
    transactions: Transaction[],
    nonce: number
  ) {
    this.version = version;
    this.timestamp = timestamp;
    this.previousHash = previousHash;
    this.transactions = transactions;
    this.merkleRoot = this.calculateMerkleRoot();
    this.nonce = nonce;
    this.hash = this.calculateHash();
  }

  calculateMerkleRoot(): string {
    const merkleTree = new MerkleTree(this.transactions.map((tx) => tx.hash()));
    return merkleTree.getRoot();
  }

  calculateHash(): string {
    const hashInput = `${this.version}${this.timestamp}${this.previousHash}${this.merkleRoot}${this.nonce}`;
    return sha256(hashInput);
  }

  validate(): boolean {
    // Implement block validation
    return true;
  }

  serialize(): string {
    // Implement block serialization
    return '';
  }
}
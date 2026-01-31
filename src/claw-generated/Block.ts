import { Transaction } from './Transaction';
import { MerkleTree } from './MerkleTree';
import crypto from 'crypto';

export class Block {
  version: number;
  timestamp: number;
  transactions: Transaction[];
  previousHash: string;
  merkleRoot: string;
  nonce: number;
  hash: string;
  uncles: { blockNumber: number; hash: string; reward: number }[];

  constructor(
    version: number,
    timestamp: number,
    transactions: Transaction[],
    previousHash: string
  ) {
    this.version = version;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.merkleRoot = this.calculateMerkleRoot();
    this.nonce = 0;
    this.hash = this.calculateHash();
    this.uncles = [];
  }

  calculateMerkleRoot(): string {
    const merkleTree = new MerkleTree(this.transactions);
    return merkleTree.getRoot();
  }

  calculateHash(): string {
    const data = `${this.version}${this.timestamp}${JSON.stringify(this.transactions)}${this.previousHash}${this.merkleRoot}${this.nonce}${JSON.stringify(this.uncles)}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  validate(): boolean {
    if (this.hash !== this.calculateHash()) {
      return false;
    }

    // Additional validation logic here, including uncle block validation
    return true;
  }

  addUncle(blockNumber: number, hash: string, reward: number): void {
    this.uncles.push({ blockNumber, hash, reward });
    this.hash = this.calculateHash();
  }

  serialize(): string {
    return JSON.stringify({
      version: this.version,
      timestamp: this.timestamp,
      transactions: this.transactions,
      previousHash: this.previousHash,
      merkleRoot: this.merkleRoot,
      nonce: this.nonce,
      hash: this.hash,
      uncles: this.uncles
    });
  }
}
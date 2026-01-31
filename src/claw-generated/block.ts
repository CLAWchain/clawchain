import { hash } from './utils';

export class Block {
  public number: number;
  public timestamp: number;
  public hash: string;
  public previousHash: string;
  public transactions: any[];

  constructor(
    number: number,
    timestamp: number,
    hash: string,
    previousHash: string,
    transactions: any[]
  ) {
    this.number = number;
    this.timestamp = timestamp;
    this.hash = hash;
    this.previousHash = previousHash;
    this.transactions = transactions;
  }

  static createCheckpoint(blockNumber: number, previousHash: string): Block {
    const timestamp = Date.now();
    const hash = hash(`${blockNumber}:${timestamp}:${previousHash}`);
    return new Block(blockNumber, timestamp, hash, previousHash, []);
  }
}
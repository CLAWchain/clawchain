export class Block {
  public hash: string;
  public parentHash: string;
  public transactions: Transaction[];
  public timestamp: number;
  public difficulty: number;
  public nonce: number;

  constructor(
    hash: string,
    parentHash: string,
    transactions: Transaction[],
    timestamp: number,
    difficulty: number,
    nonce: number
  ) {
    this.hash = hash;
    this.parentHash = parentHash;
    this.transactions = transactions;
    this.timestamp = timestamp;
    this.difficulty = difficulty;
    this.nonce = nonce;
  }
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: number;
  nonce: number;
  signature: string;
}
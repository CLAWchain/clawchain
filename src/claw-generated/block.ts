export class Block {
  hash: string;
  previousHash: string;
  timestamp: number;
  transactions: Transaction[];
  nonce: number;

  constructor(
    hash: string,
    previousHash: string,
    timestamp: number,
    transactions: Transaction[],
    nonce: number
  ) {
    this.hash = hash;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.nonce = nonce;
  }
}

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  fee: number;
  nonce: number;
  signature: string;
}
export class Transaction {
  hash: string;
  from: string;
  to: string;
  value: number;
  gas: number;
  data: string;

  constructor(
    hash: string,
    from: string,
    to: string,
    value: number,
    gas: number,
    data: string
  ) {
    this.hash = hash;
    this.from = from;
    this.to = to;
    this.value = value;
    this.gas = gas;
    this.data = data;
  }
}

export class Block {
  hash: string;
  prevHash: string;
  transactions: Transaction[];
  timestamp: number;
  nonce: number;
  height: number;

  constructor(
    hash: string,
    prevHash: string,
    transactions: Transaction[],
    timestamp: number,
    nonce: number,
    height: number
  ) {
    this.hash = hash;
    this.prevHash = prevHash;
    this.transactions = transactions;
    this.timestamp = timestamp;
    this.nonce = nonce;
    this.height = height;
  }
}
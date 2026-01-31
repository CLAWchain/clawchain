export class Block {
  constructor(
    public index: number,
    public timestamp: number,
    public transactions: Transaction[],
    public previousHash: string,
    public hash: string,
    public nonce: number
  ) {}
}

export class Transaction {
  constructor(
    public from: string,
    public to: string,
    public amount: number,
    public signature: string
  ) {}
}
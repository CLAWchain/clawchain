export class Block {
  public readonly index: number;
  public readonly timestamp: number;
  public readonly data: any;
  public readonly previousHash: string;
  public readonly hash: string;
  public readonly size: number;

  constructor(
    index: number,
    timestamp: number,
    data: any,
    previousHash: string,
    hash: string,
    size: number
  ) {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = hash;
    this.size = size;
  }
}
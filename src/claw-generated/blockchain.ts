import { Block } from './block';

export class BlockChain {
  private readonly chain: Block[] = [];
  private _maxBlockSize: number = 1000000; // 1 MB

  constructor() {
    // Create the genesis block
    this.addBlock(
      0,
      Date.now(),
      'Genesis Block',
      '0000000000000000000000000000000000000000000000000000000000000000',
      '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b'
    );
  }

  private addBlock(
    index: number,
    timestamp: number,
    data: any,
    previousHash: string,
    hash: string
  ): void {
    const size = JSON.stringify(data).length;
    if (size > this.maxBlockSize) {
      throw new Error(`Block size of ${size} bytes exceeds the limit of ${this.maxBlockSize} bytes.`);
    }

    const block = new Block(index, timestamp, data, previousHash, hash, size);
    this.chain.push(block);
  }

  public get maxBlockSize(): number {
    return this._maxBlockSize;
  }

  public set maxBlockSize(size: number) {
    this._maxBlockSize = size;
  }

  public getChain(): Block[] {
    return this.chain;
  }
}
import { GenesisConfig, loadGenesisConfig } from '../config/genesis';

export class Block {
  public hash: string;
  public uncles: Block[] = [];
  public unclePositions: number[] = [];

  constructor(
    public number: number,
    public timestamp: number,
    public transactions: Transaction[],
    public parentHash: string,
    public genesisConfig: GenesisConfig
  ) {
    this.hash = this.calculateHash();
  }

  calculateHash(): string {
    // Implement hash calculation logic
    return `0x${this.number.toString(16)}`;
  }

  validateSize(maxBlockSize: number): boolean {
    // Validate block size against the maximum
    return this.size <= maxBlockSize;
  }

  get size(): number {
    // Calculate the size of the block
    return JSON.stringify(this).length;
  }

  static createGenesis(): Block {
    const genesisConfig = loadGenesisConfig('config/genesis.json');
    return new Block(0, Date.now(), [], '0x0', genesisConfig);
  }

  addUncle(uncle: Block, position: number): void {
    this.uncles.push(uncle);
    this.unclePositions.push(position);
  }
}

export class Transaction {
  // Transaction properties and methods
}
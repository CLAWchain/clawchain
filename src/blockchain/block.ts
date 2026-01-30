import { GenesisConfig, loadGenesisConfig } from '../config/genesis';

export class Block {
  constructor(
    public number: number,
    public timestamp: number,
    public transactions: Transaction[],
    public parentHash: string,
    public genesisConfig: GenesisConfig
  ) {}

  static createGenesis(): Block {
    const genesisConfig = loadGenesisConfig('config/genesis.json');
    return new Block(0, Date.now(), [], '0x0', genesisConfig);
  }

  // Other block methods
}
import { Block } from './Block';
import { Chain } from './Chain';
import { StateManager } from './StateManager';
import { Crypto } from './Crypto';

export class GenesisConfig {
  private static instance: GenesisConfig;

  private chainId: string;
  private initialTokenAllocations: { [address: string]: number };
  private initialValidators: string[];
  private blockTime: number;
  private blockSizeLimit: number;

  private constructor() {
    // Load configuration from file or other source
    this.chainId = 'claw-testnet-1';
    this.initialTokenAllocations = {
      '0x1234567890123456789012345678901234567890': 1000000,
      '0x0987654321098765432109876543210987654321': 500000,
    };
    this.initialValidators = [
      '0x1234567890123456789012345678901234567890',
      '0x0987654321098765432109876543210987654321',
    ];
    this.blockTime = 10; // seconds
    this.blockSizeLimit = 1000000; // bytes
  }

  public static getInstance(): GenesisConfig {
    if (!GenesisConfig.instance) {
      GenesisConfig.instance = new GenesisConfig();
    }
    return GenesisConfig.instance;
  }

  public validateConfig(): boolean {
    // Validate configuration for consistency and security
    return true;
  }

  public generateGenesisBlock(): Block {
    // Generate the initial state of the blockchain based on the configuration
    const genesisBlock = new Block({
      parentHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      timestamp: Math.floor(Date.now() / 1000),
      transactions: [],
      validator: '0x1234567890123456789012345678901234567890',
      blockSize: 0,
      blockNumber: 0,
      chainId: this.chainId,
    });

    // Set initial token allocations
    const stateManager = StateManager.getInstance();
    for (const [address, balance] of Object.entries(this.initialTokenAllocations)) {
      stateManager.setBalance(Crypto.toBuffer(address), balance);
    }

    // Set initial validator set
    const chain = Chain.getInstance();
    for (const validator of this.initialValidators) {
      chain.addValidator(Crypto.toBuffer(validator));
    }

    return genesisBlock;
  }
}
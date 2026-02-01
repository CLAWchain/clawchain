import { GenesisConfig } from './GenesisConfig';
import { Chain } from './Chain';
import { Crypto } from './Crypto';

export class StateManager {
  private static instance: StateManager;
  private state: Map<string, number>;

  private constructor() {
    this.state = new Map();
    this.initializeState();
  }

  public static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  private initializeState(): void {
    const genesisConfig = GenesisConfig.getInstance();
    const genesisBlock = genesisConfig.generateGenesisBlock();

    // Set initial token allocations
    for (const [address, balance] of Object.entries(genesisConfig.initialTokenAllocations)) {
      this.setBalance(Crypto.toBuffer(address), balance);
    }

    // Set initial validator set
    const chain = Chain.getInstance();
    for (const validator of genesisConfig.initialValidators) {
      chain.addValidator(Crypto.toBuffer(validator));
    }
  }

  public getBalance(address: Buffer): number {
    const addressHex = Crypto.bufferToHex(address);
    return this.state.get(addressHex) || 0;
  }

  public setBalance(address: Buffer, balance: number): void {
    const addressHex = Crypto.bufferToHex(address);
    this.state.set(addressHex, balance);
  }
}
import { GenesisConfig } from './GenesisConfig';
import { Chain } from './Chain';
import { Crypto } from './Crypto';

export class StateManager {
  private static instance: StateManager;
  private state: Map<string, number>;
  private stateCheckpoints: Map<number, Map<string, number>>;
  private pruningInterval: number;
  private maxCheckpointAge: number;

  private constructor() {
    this.state = new Map();
    this.stateCheckpoints = new Map();
    this.pruningInterval = 100; // Prune state every 100 blocks
    this.maxCheckpointAge = 1000; // Keep checkpoints for up to 1000 blocks
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

    // Create initial state checkpoint
    this.createStateCheckpoint(0);
  }

  public getBalance(address: Buffer): number {
    const addressHex = Crypto.bufferToHex(address);
    return this.state.get(addressHex) || 0;
  }

  public setBalance(address: Buffer, balance: number): void {
    const addressHex = Crypto.bufferToHex(address);
    this.state.set(addressHex, balance);
  }

  public createStateCheckpoint(blockNumber: number): void {
    this.stateCheckpoints.set(blockNumber, new Map(this.state));
  }

  public pruneState(currentBlockNumber: number): void {
    // Remove old checkpoints
    for (const [blockNumber, checkpoint] of this.stateCheckpoints.entries()) {
      if (currentBlockNumber - blockNumber > this.maxCheckpointAge) {
        this.stateCheckpoints.delete(blockNumber);
      }
    }

    // Prune the live state data
    for (const [address, balance] of this.state.entries()) {
      const latestCheckpoint = this.getLatestCheckpointBeforeBlock(currentBlockNumber);
      if (latestCheckpoint && this.state.get(address) === latestCheckpoint.get(address)) {
        this.state.delete(address);
      }
    }
  }

  private getLatestCheckpointBeforeBlock(blockNumber: number): Map<string, number> | null {
    let latestCheckpoint: Map<string, number> | null = null;
    for (const [checkpointBlockNumber, checkpoint] of this.stateCheckpoints.entries()) {
      if (checkpointBlockNumber <= blockNumber) {
        latestCheckpoint = checkpoint;
      }
    }
    return latestCheckpoint;
  }
}
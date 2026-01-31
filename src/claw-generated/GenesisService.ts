import { GENESIS_CONFIG } from './genesis';
import { GenesisAllocation, GenesisConfig } from './types';

export class GenesisService {
  private config: GenesisConfig;

  constructor() {
    this.config = GENESIS_CONFIG;
  }

  getChainId(): string {
    return this.config.chainId;
  }

  getAllocations(): GenesisAllocation[] {
    return this.config.allocations;
  }

  getProtocolParams(): {
    blockTime: number;
    blockSize: number;
    minTxFee: number;
  } {
    return this.config.protocolParams;
  }
}
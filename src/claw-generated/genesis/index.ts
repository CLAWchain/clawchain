// src/claw-generated/genesis/index.ts

import fs from 'fs';
import path from 'path';
import { GenesisConfig, GenesisAllocation } from './types';
import { Block } from '../blockchain/block';

export class GenesisManager {
  private config: GenesisConfig;

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    const configPath = path.join(__dirname, 'genesis.config.json');
    try {
      const configData = fs.readFileSync(configPath, 'utf8');
      this.config = JSON.parse(configData);
      this.validateConfig();
    } catch (err) {
      console.error('Error loading genesis config:', err);
      throw err;
    }
  }

  private validateConfig(): void {
    const { chainId, initialAllocations, blockTime, difficulty, blockReward } = this.config;

    // Validate chain ID
    if (typeof chainId !== 'string' || chainId.trim() === '') {
      throw new Error('Invalid chain ID in genesis config');
    }

    // Validate initial allocations
    if (!Array.isArray(initialAllocations) || initialAllocations.length === 0) {
      throw new Error('Genesis config must have at least one initial allocation');
    }
    for (const alloc of initialAllocations) {
      if (typeof alloc.address !== 'string' || alloc.address.trim() === '') {
        throw new Error('Invalid address in genesis allocation');
      }
      if (typeof alloc.amount !== 'number' || alloc.amount <= 0) {
        throw new Error('Invalid amount in genesis allocation');
      }
    }

    // Validate other parameters
    if (typeof blockTime !== 'number' || blockTime <= 0) {
      throw new Error('Invalid block time in genesis config');
    }
    if (typeof difficulty !== 'number' || difficulty <= 0) {
      throw new Error('Invalid difficulty in genesis config');
    }
    if (typeof blockReward !== 'number' || blockReward <= 0) {
      throw new Error('Invalid block reward in genesis config');
    }
  }

  createGenesisBlock(): Block {
    const { chainId, initialAllocations, blockTime, difficulty, blockReward } = this.config;

    // Create the genesis block
    const genesisBlock = new Block({
      chainId,
      timestamp: 0,
      transactions: initialAllocations.map((alloc) => ({
        from: '0x0',
        to: alloc.address,
        amount: alloc.amount,
        nonce: 0,
        data: '',
        signature: '',
      })),
      difficulty,
      blockReward,
    });

    return genesisBlock;
  }

  getConfig(): GenesisConfig {
    return this.config;
  }
}
import * as fs from 'fs';
import * as path from 'path';

export interface GenesisConfig {
  chainId: string;
  timestamp: number;
  blockReward: number;
  blockSize: number;
  initialAllocations: {
    [address: string]: number;
  };
}

export function loadGenesisConfig(): GenesisConfig {
  const configPath = path.join(__dirname, '../../config/genesis.json');
  const configJson = fs.readFileSync(configPath, 'utf8');
  return JSON.parse(configJson) as GenesisConfig;
}
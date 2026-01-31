import fs from 'fs';
import path from 'path';

export interface GenesisConfig {
  chainId: string;
  initialTokenAllocations: { [address: string]: number };
  initialValidators: string[];
  blockRewardSchedule: { [height: number]: number };
  difficultyAdjustmentParams: {
    targetBlockTime: number;
    adjustmentWindow: number;
  };
  otherSettings: { [key: string]: any };
}

export function loadGenesisConfig(configPath: string): GenesisConfig {
  const configFile = fs.readFileSync(path.join(process.cwd(), configPath), 'utf8');
  return JSON.parse(configFile) as GenesisConfig;
}
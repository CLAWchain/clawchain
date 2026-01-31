import { Account, GenesisConfig, BlockHeader } from './types';
import { readFileSync } from 'fs';
import { MerklePatriciaTrie } from './MerklePatriciaTrie';
import { keccak256 } from 'js-sha3';

export function loadGenesisConfig(path: string): GenesisConfig {
  const configData = readFileSync(path, 'utf8');
  return JSON.parse(configData) as GenesisConfig;
}

export interface GenesisConfig {
  chainId: string;
  timestamp: number;
  initialAccounts: Account[];
  initialValidators: string[];
  initialTokenDistribution: { [address: string]: string };
  networkParams: {
    blockTime: number;
    maxBlockSize: number;
    maxTransactionsPerBlock: number;
  };
  protocolUpgrades: {
    [blockNumber: number]: {
      name: string;
      changes: any;
    };
  };
}

export function generateGenesisBlock(config: GenesisConfig): BlockHeader {
  // Create initial state trie
  const stateTrie = new MerklePatriciaTrie();
  for (const account of config.initialAccounts) {
    stateTrie.set(account.address, account.balance);
  }

  // Generate genesis block header
  const genesisBlock: BlockHeader = {
    number: 0,
    timestamp: config.timestamp,
    parentHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    stateRoot: stateTrie.root,
    transactionsRoot: '0x0000000000000000000000000000000000000000000000000000000000000000',
    receiptsRoot: '0x0000000000000000000000000000000000000000000000000000000000000000',
    gasUsed: 0,
    gasLimit: config.networkParams.maxBlockSize,
    difficulty: 0,
    nonce: '0x0000000000000000',
    extraData: '',
    hash: '0x' + keccak256(JSON.stringify(genesisBlock))
  };

  return genesisBlock;
}

export const defaultGenesisConfig: GenesisConfig = {
  chainId: 'clawchain',
  timestamp: Math.floor(Date.now() / 1000),
  initialAccounts: [
    {
      address: '0x0123456789012345678901234567890123456789',
      balance: '1000000000000000000000'
    }
  ],
  initialValidators: ['0x0123456789012345678901234567890123456789'],
  initialTokenDistribution: {
    '0x0123456789012345678901234567890123456789': '1000000000000000000000'
  },
  networkParams: {
    blockTime: 10,
    maxBlockSize: 1000000,
    maxTransactionsPerBlock: 1000
  },
  protocolUpgrades: {
    1000000: {
      name: 'Upgrade v1.1',
      changes: {
        // ...
      }
    }
  }
};
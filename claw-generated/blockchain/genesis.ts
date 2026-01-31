import { GenesisConfig } from './config';
import { Block, BlockHeader, Account } from './types';

export function initializeGenesisBlock(config: GenesisConfig): Block {
  const genesisHeader: BlockHeader = {
    chainId: config.chainId,
    number: 0,
    timestamp: Date.now(),
    difficulty: 0,
    gasLimit: 0,
    gasUsed: 0,
    hash: '',
    parentHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    stateRoot: '0x0000000000000000000000000000000000000000000000000000000000000000',
    transactionsRoot: '0x0000000000000000000000000000000000000000000000000000000000000000',
    receiptsRoot: '0x0000000000000000000000000000000000000000000000000000000000000000'
  };

  const genesisBlock: Block = {
    header: genesisHeader,
    transactions: [],
    uncles: []
  };

  // Initialize genesis block state based on config
  const initialState: { [address: string]: Account } = {};

  // Set initial token allocations
  for (const [address, balance] of Object.entries(config.initialTokenAllocations)) {
    initialState[address] = { balance };
  }

  // Set initial validators
  for (const validatorAddress of config.initialValidators) {
    initialState[validatorAddress] = { isValidator: true };
  }

  // Set other initial state
  for (const [address, account] of Object.entries(config.otherSettings.initialState)) {
    initialState[address] = account;
  }

  // Set the state root based on the initial state
  genesisHeader.stateRoot = calculateStateRoot(initialState);

  return genesisBlock;
}

function calculateStateRoot(state: { [address: string]: Account }): string {
  // Implement Merkle Patricia Trie logic to calculate the state root
  return '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
}

export interface Account {
  balance?: number;
  isValidator?: boolean;
  [key: string]: any;
}
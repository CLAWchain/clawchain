import { MerklePatriciaTrie } from '../state/MerklePatriciaTrie';
import { Account, Block, BlockHeader } from './types';

export interface GenesisConfig {
  chainId: string;
  initialTokenAllocations: { [address: string]: number };
  initialValidators: string[];
  otherSettings: {
    initialState: { [address: string]: Account };
  };
}

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
  const initialState: { [address: string]: Account } = {
    ...config.otherSettings.initialState
  };

  // Set initial token allocations
  for (const [address, balance] of Object.entries(config.initialTokenAllocations)) {
    initialState[address] = { balance };
  }

  // Set initial validators
  for (const validatorAddress of config.initialValidators) {
    initialState[validatorAddress] = { isValidator: true };
  }

  // Calculate the state root based on the initial state
  genesisHeader.stateRoot = calculateStateRoot(initialState);

  return genesisBlock;
}

function calculateStateRoot(state: { [address: string]: Account }): string {
  const trie = new MerklePatriciaTrie();
  for (const [address, account] of Object.entries(state)) {
    trie.insert(address, JSON.stringify(account));
  }
  return trie.getRootHash();
}
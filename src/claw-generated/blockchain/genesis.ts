import { Block, Transaction, hexToBase58 } from './block';
import { Blockchain } from './index';

export interface GenesisConfiguration {
  chainId: string;
  timestamp: number;
  initialAllocations: { [address: string]: bigint };
  initialParameters: {
    blockTime: number;
    gasLimit: bigint;
    difficulty: number;
  };
}

export class GenesisBlock extends Block {
  constructor(config: GenesisConfiguration) {
    const transactions: Transaction[] = Object.entries(config.initialAllocations).map(([address, balance]) => ({
      hash: hexToBase58(address),
      from: '0'.repeat(44),
      to: address,
      value: balance,
      gasPrice: 1000n,
      gasLimit: 21000n,
      nonce: 0,
      signature: ''
    }));

    super(
      0,
      '0'.repeat(44),
      '0'.repeat(44),
      transactions,
      config.initialParameters.difficulty
    );

    this.header.timestamp = config.timestamp;
    this.header.gasLimit = config.initialParameters.gasLimit;
    this.header.chainId = config.chainId;
  }
}

export function initializeBlockchain(config: GenesisConfiguration): Blockchain {
  const genesisBlock = new GenesisBlock(config);
  const blockchain = new Blockchain();
  blockchain.addBlock(genesisBlock);
  return blockchain;
}
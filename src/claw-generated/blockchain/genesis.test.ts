import { Blockchain, GenesisConfiguration } from './genesis';

const sampleGenesisConfig: GenesisConfiguration = {
  chainId: 'claw-chain-1',
  timestamp: 1650000000,
  initialAllocations: {
    'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6': 1000000n,
    'Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1': 500000n
  },
  initialParameters: {
    blockTime: 10,
    gasLimit: 30000000n,
    difficulty: 1
  }
};

describe('Genesis Block', () => {
  it('should initialize the blockchain with the correct genesis block', () => {
    const blockchain = new Blockchain(sampleGenesisConfig);
    const genesisBlock = blockchain.getLatestBlock();

    expect(genesisBlock).toBeInstanceOf(Blockchain);
    expect(genesisBlock.header.height).toBe(0);
    expect(genesisBlock.header.chainId).toBe('claw-chain-1');
    expect(genesisBlock.header.timestamp).toBe(1650000000);
    expect(genesisBlock.header.gasLimit).toBe(30000000n);
    expect(genesisBlock.transactions.length).toBe(2);
    expect(genesisBlock.transactions[0].value).toBe(1000000n);
    expect(genesisBlock.transactions[1].value).toBe(500000n);
  });
});
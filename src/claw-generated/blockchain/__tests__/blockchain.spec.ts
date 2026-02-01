import { Blockchain } from '../blockchain';
import { Block } from '../block';
import { AccountStorage } from '../../AccountStorage';
import { ContractStorage } from '../../contracts/ContractStorage';
import { PeerManager } from '../../networking/peer_manager';

describe('Blockchain', () => {
  let blockchain: Blockchain;
  let accountStorage: AccountStorage;
  let contractStorage: ContractStorage;
  let peerManager: PeerManager;

  beforeEach(() => {
    accountStorage = new AccountStorage();
    contractStorage = new ContractStorage();
    peerManager = new PeerManager();
    blockchain = new Blockchain(peerManager, accountStorage, contractStorage);
  });

  test('should reorganize chain when a longer valid chain is discovered', () => {
    // Create the initial chain
    const block1 = new Block({ height: 1, parentHash: '0x0' });
    const block2 = new Block({ height: 2, parentHash: block1.hash });
    const block3 = new Block({ height: 3, parentHash: block2.hash });
    blockchain.addBlock(block1);
    blockchain.addBlock(block2);
    blockchain.addBlock(block3);

    // Create a longer valid chain
    const longerBlock1 = new Block({ height: 1, parentHash: '0x0' });
    const longerBlock2 = new Block({ height: 2, parentHash: longerBlock1.hash });
    const longerBlock3 = new Block({ height: 3, parentHash: longerBlock2.hash });
    const longerBlock4 = new Block({ height: 4, parentHash: longerBlock3.hash });
    blockchain.addBlock(longerBlock1);
    blockchain.addBlock(longerBlock2);
    blockchain.addBlock(longerBlock3);
    blockchain.addBlock(longerBlock4);

    // Verify the chain was reorganized
    expect(blockchain.blocks.length).toBe(4);
    expect(blockchain.blocks[0]).toEqual(longerBlock1);
    expect(blockchain.blocks[1]).toEqual(longerBlock2);
    expect(blockchain.blocks[2]).toEqual(longerBlock3);
    expect(blockchain.blocks[3]).toEqual(longerBlock4);
  });
});
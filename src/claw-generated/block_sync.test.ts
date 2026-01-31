import { BlockSync } from './block_sync';
import { Block } from '../blockchain/block';
import { Peer } from '../network/peer';
import { LocalChain } from '../blockchain/local_chain';

describe('BlockSync', () => {
  let blockSync: BlockSync;
  let peers: Peer[];
  let localChain: LocalChain;

  beforeEach(() => {
    peers = [
      { getLatestBlockHeight: () => 100, getBlocks: (heights) => heights.map(h => new Block({ height: h })) },
      { getLatestBlockHeight: () => 90, getBlocks: (heights) => heights.map(h => new Block({ height: h })) },
      { getLatestBlockHeight: () => 95, getBlocks: (heights) => heights.map(h => new Block({ height: h })) }
    ];
    localChain = {
      getLatestBlock: () => new Block({ height: 80 }),
      verifyBlock: async (block) => true,
      addBlock: async (block) => {}
    };
    blockSync = new BlockSync(peers, localChain);
  });

  test('should detect missing blocks', async () => {
    await blockSync.detectMissingBlocks();
    expect(blockSync.missingBlocks.length).toBe(20);
  });

  test('should download missing blocks', async () => {
    await blockSync.detectMissingBlocks();
    await blockSync.downloadMissingBlocks();
    expect(blockSync.missingBlocks.length).toBe(20);
  });

  test('should verify and integrate missing blocks', async () => {
    await blockSync.detectMissingBlocks();
    await blockSync.downloadMissingBlocks();
    await blockSync.verifyAndIntegrateBlocks();
    expect(localChain.getLatestBlock().height).toBe(100);
  });
});
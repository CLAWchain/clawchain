import { BlockSyncManager } from '../BlockSyncManager';
import { Peer } from '../../networking/Peer';
import { Block } from '../../chain/Block';

describe('BlockSyncManager', () => {
  test('detects missing blocks', async () => {
    const localChainHead = new Block({ height: 99, hash: 'abc123' });
    const syncManager = new BlockSyncManager(localChainHead);

    syncManager.addPeer(new Peer({ chainHead: new Block({ height: 200, hash: 'def456' }) }));
    syncManager.addPeer(new Peer({ chainHead: new Block({ height: 400, hash: 'ghi789' }) }));

    const missingRanges = await syncManager.detectMissingBlocks();
    expect(missingRanges).toEqual([[100, 200], [300, 400]]);
  });

  test('requests and integrates blocks', async () => {
    const localChainHead = new Block({ height: 99, hash: 'abc123' });
    const syncManager = new BlockSyncManager(localChainHead);

    syncManager.addPeer(new Peer());

    const downloadedBlocks = await syncManager.requestBlocks([[100, 200]]);
    expect(downloadedBlocks.length).toBe(101);

    await syncManager.validateAndIntegrateBlocks(downloadedBlocks);
    // Verify the local chain has been updated correctly
  });
});
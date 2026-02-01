import { BlockManager } from './BlockManager';
import { Block } from './Block';

describe('BlockManager', () => {
  let blockManager: BlockManager;

  beforeEach(() => {
    blockManager = new BlockManager();
  });

  it('should finalize blocks with enough confirmations', () => {
    const block1 = new Block({ hash: 'block1', previousBlock: null });
    const block2 = new Block({ hash: 'block2', previousBlock: block1 });
    const block3 = new Block({ hash: 'block3', previousBlock: block2 });
    const block4 = new Block({ hash: 'block4', previousBlock: block3 });
    const block5 = new Block({ hash: 'block5', previousBlock: block4 });
    const block6 = new Block({ hash: 'block6', previousBlock: block5 });

    blockManager.addBlock(block1);
    blockManager.addBlock(block2);
    blockManager.addBlock(block3);
    blockManager.addBlock(block4);
    blockManager.addBlock(block5);
    blockManager.addBlock(block6);

    expect(blockManager.getFinalizedBlocks().length).toBe(6);
    expect(blockManager.getPendingBlocks().length).toBe(0);
  });

  it('should track finalized and pending blocks', () => {
    const block1 = new Block({ hash: 'block1', previousBlock: null });
    const block2 = new Block({ hash: 'block2', previousBlock: block1 });
    const block3 = new Block({ hash: 'block3', previousBlock: block2 });

    blockManager.addBlock(block1);
    blockManager.addBlock(block2);
    blockManager.addBlock(block3);

    expect(blockManager.getFinalizedBlocks().length).toBe(1);
    expect(blockManager.getPendingBlocks().length).toBe(2);

    expect(blockManager.getFinalizationStatus('block1')).toEqual({ finalized: true, confirmations: 3 });
    expect(blockManager.getFinalizationStatus('block2')).toEqual({ finalized: false, confirmations: 2 });
    expect(blockManager.getFinalizationStatus('block3')).toEqual({ finalized: false, confirmations: 1 });
  });
});
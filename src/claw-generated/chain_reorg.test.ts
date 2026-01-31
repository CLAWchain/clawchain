import { describe, it, expect } from 'vitest';
import { Chain } from './chain';
import { Block } from '../models/block';

describe('Chain Reorganization', () => {
  it('should handle a simple chain reorganization', () => {
    const chain = new Chain();

    // Add some initial blocks
    const block1 = new Block({ height: 1, hash: 'block1' });
    const block2 = new Block({ height: 2, hash: 'block2' });
    chain.addBlock(block1);
    chain.addBlock(block2);

    // Create a competing chain
    const block3 = new Block({ height: 3, hash: 'block3' });
    const block4 = new Block({ height: 4, hash: 'block4' });
    const competingChain = new Chain();
    competingChain.addBlock(block1);
    competingChain.addBlock(block2);
    competingChain.addBlock(block3);
    competingChain.addBlock(block4);

    // Verify the chain reorganization
    expect(chain.getLatestBlock().hash).toEqual('block2');
    chain.reorganizeChain(competingChain);
    expect(chain.getLatestBlock().hash).toEqual('block4');
  });

  it('should handle a more complex chain reorganization', () => {
    const chain = new Chain();

    // Add some initial blocks
    const block1 = new Block({ height: 1, hash: 'block1' });
    const block2 = new Block({ height: 2, hash: 'block2' });
    const block3 = new Block({ height: 3, hash: 'block3' });
    const block4 = new Block({ height: 4, hash: 'block4' });
    const block5 = new Block({ height: 5, hash: 'block5' });
    chain.addBlock(block1);
    chain.addBlock(block2);
    chain.addBlock(block3);
    chain.addBlock(block4);
    chain.addBlock(block5);

    // Create a competing chain
    const block3a = new Block({ height: 3, hash: 'block3a' });
    const block4a = new Block({ height: 4, hash: 'block4a' });
    const block5a = new Block({ height: 5, hash: 'block5a' });
    const block6a = new Block({ height: 6, hash: 'block6a' });
    const competingChain = new Chain();
    competingChain.addBlock(block1);
    competingChain.addBlock(block2);
    competingChain.addBlock(block3a);
    competingChain.addBlock(block4a);
    competingChain.addBlock(block5a);
    competingChain.addBlock(block6a);

    // Verify the chain reorganization
    expect(chain.getLatestBlock().hash).toEqual('block5');
    chain.reorganizeChain(competingChain);
    expect(chain.getLatestBlock().hash).toEqual('block6a');
  });
});
import { expect } from 'chai';
import { generateBlock, generateTransaction } from '../utils/testing';
import { ChainManager } from '../consensus/chain_manager';

describe('Chain Reorganization Tests', () => {
  let chainManager: ChainManager;

  beforeEach(() => {
    chainManager = new ChainManager();
  });

  it('should handle a simple chain reorganization', async () => {
    // Generate an initial chain
    const block1 = await generateBlock(chainManager, []);
    const block2 = await generateBlock(chainManager, [generateTransaction()]);
    const block3 = await generateBlock(chainManager, [generateTransaction()]);

    // Verify the initial chain
    expect(chainManager.getChain()).to.deep.equal([block1, block2, block3]);

    // Generate a competing chain
    const block2Alt = await generateBlock(chainManager, [generateTransaction()]);
    const block3Alt = await generateBlock(chainManager, [generateTransaction()]);

    // Add the competing chain and verify the reorganization
    await chainManager.addBlock(block2Alt);
    await chainManager.addBlock(block3Alt);
    expect(chainManager.getChain()).to.deep.equal([block1, block2Alt, block3Alt]);
  });
});
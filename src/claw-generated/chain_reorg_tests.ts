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

  it('should handle a reorganization with multiple competing chains', async () => {
    // Generate an initial chain
    const block1 = await generateBlock(chainManager, []);
    const block2 = await generateBlock(chainManager, [generateTransaction()]);
    const block3 = await generateBlock(chainManager, [generateTransaction()]);

    // Generate competing chains
    const block2Alt1 = await generateBlock(chainManager, [generateTransaction()]);
    const block3Alt1 = await generateBlock(chainManager, [generateTransaction()]);
    const block3Alt2 = await generateBlock(chainManager, [generateTransaction()]);

    // Add the competing chains and verify the reorganization
    await chainManager.addBlock(block2Alt1);
    await chainManager.addBlock(block3Alt1);
    expect(chainManager.getChain()).to.deep.equal([block1, block2Alt1, block3Alt1]);

    await chainManager.addBlock(block3Alt2);
    expect(chainManager.getChain()).to.deep.equal([block1, block2Alt1, block3Alt2]);
  });

  it('should handle a reorganization with conflicting transactions', async () => {
    // Generate an initial chain
    const tx1 = generateTransaction();
    const block1 = await generateBlock(chainManager, [tx1]);
    const block2 = await generateBlock(chainManager, [generateTransaction()]);
    const block3 = await generateBlock(chainManager, [generateTransaction()]);

    // Generate a competing chain with a conflicting transaction
    const tx2 = generateTransaction({ input: tx1.output });
    const block2Alt = await generateBlock(chainManager, [tx2]);
    const block3Alt = await generateBlock(chainManager, [generateTransaction()]);

    // Add the competing chain and verify the reorganization
    await chainManager.addBlock(block2Alt);
    await chainManager.addBlock(block3Alt);
    expect(chainManager.getChain()).to.deep.equal([block1, block2Alt, block3Alt]);
  });
});
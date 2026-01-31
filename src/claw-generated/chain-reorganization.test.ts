import { Block } from './Block';
import { ForkManager } from './Consensus';
import { AIValidationResult } from './AIValidator';

describe('Chain Reorganization', () => {
  let forkManager: ForkManager;

  beforeEach(() => {
    forkManager = new ForkManager();
  });

  it('should prefer the longest chain', () => {
    // Create two chains
    const chain1 = [
      new Block({ height: 1, parentHash: '0000000000000000000000000000000000000000000000000000000000000000' }),
      new Block({ height: 2, parentHash: chain1[0].header.hash }),
      new Block({ height: 3, parentHash: chain1[1].header.hash }),
    ];
    const chain2 = [
      new Block({ height: 1, parentHash: '0000000000000000000000000000000000000000000000000000000000000000' }),
      new Block({ height: 2, parentHash: chain2[0].header.hash }),
      new Block({ height: 3, parentHash: chain2[1].header.hash }),
      new Block({ height: 4, parentHash: chain2[2].header.hash }),
    ];

    // Add the blocks and verify the longest chain is chosen
    forkManager.addBlock(chain1[0], { valid: true, confidence: 0.8, flags: {} } as AIValidationResult);
    forkManager.addBlock(chain1[1], { valid: true, confidence: 0.8, flags: {} } as AIValidationResult);
    forkManager.addBlock(chain1[2], { valid: true, confidence: 0.8, flags: {} } as AIValidationResult);
    forkManager.addBlock(chain2[0], { valid: true, confidence: 0.8, flags: {} } as AIValidationResult);
    forkManager.addBlock(chain2[1], { valid: true, confidence: 0.8, flags: {} } as AIValidationResult);
    forkManager.addBlock(chain2[2], { valid: true, confidence: 0.8, flags: {} } as AIValidationResult);
    forkManager.addBlock(chain2[3], { valid: true, confidence: 0.8, flags: {} } as AIValidationResult);

    expect(forkManager.getMainChain()).toEqual(chain2);
  });

  it('should prefer the chain with earlier timestamp when lengths are equal', () => {
    // Create two chains of equal length
    const chain1 = [
      new Block({ height: 1, parentHash: '0000000000000000000000000000000000000000000000000000000000000000', timestamp: 1000 }),
      new Block({ height: 2, parentHash: chain1[0].header.hash, timestamp: 2000 }),
      new Block({ height: 3, parentHash: chain1[1].header.hash, timestamp: 3000 }),
    ];
    const chain2 = [
      new Block({ height: 1, parentHash: '0000000000000000000000000000000000000000000000000000000000000000', timestamp: 1000 }),
      new Block({ height: 2, parentHash: chain2[0].header.hash, timestamp: 1500 }),
      new Block({ height: 3, parentHash: chain2[1].header.hash, timestamp: 2000 }),
    ];

    // Add the blocks and verify the chain with earlier timestamp is chosen
    forkManager.addBlock(chain1[0], { valid: true, confidence: 0.8, flags: {} } as AIValidationResult);
    forkManager.addBlock(chain1[1], { valid: true, confidence: 0.8, flags: {} } as AIValidationResult);
    forkManager.addBlock(chain1[2], { valid: true, confidence: 0.8, flags: {} } as AIValidationResult);
    forkManager.addBlock(chain2[0], { valid: true, confidence: 0.8, flags: {} } as AIValidationResult);
    forkManager.addBlock(chain2[1], { valid: true, confidence: 0.8, flags: {} } as AIValidationResult);
    forkManager.addBlock(chain2[2], { valid: true, confidence: 0.8, flags: {} } as AIValidationResult);

    expect(forkManager.getMainChain()).toEqual(chain2);
  });
});
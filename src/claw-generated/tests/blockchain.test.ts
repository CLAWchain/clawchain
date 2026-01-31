import { Blockchain } from '../blockchain';
import { Block } from '../block';
import { CONFIG } from '../config';

describe('Blockchain', () => {
  it('should create checkpoints at the correct interval', () => {
    const blockchain = new Blockchain();

    for (let i = 0; i < CONFIG.CHECKPOINT_INTERVAL * 2; i++) {
      blockchain.addBlock(new Block(i, 'some-hash', []));
    }

    expect(blockchain.checkpoints.length).toEqual(2);
    expect(blockchain.checkpoints[0].blockNumber).toEqual(CONFIG.CHECKPOINT_INTERVAL);
    expect(blockchain.checkpoints[1].blockNumber).toEqual(CONFIG.CHECKPOINT_INTERVAL * 2);
  });

  it('should verify blocks from checkpoint', () => {
    const blockchain = new Blockchain();

    for (let i = 0; i < CONFIG.CHECKPOINT_INTERVAL * 2; i++) {
      const block = new Block(i, 'some-hash', []);
      block.verify = jest.fn().mockReturnValue(true);
      blockchain.addBlock(block);
    }

    expect(blockchain.verifyFromCheckpoint(CONFIG.CHECKPOINT_INTERVAL)).toBe(true);
  });
});
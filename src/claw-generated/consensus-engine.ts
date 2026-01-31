import { Block } from '../types';
import { BlockValidator } from './block-validator';
import { RewardCalculator } from './reward-calculator';

export class ConsensusEngine {
  private blockValidator: BlockValidator;
  private rewardCalculator: RewardCalculator;

  constructor() {
    this.blockValidator = new BlockValidator();
    this.rewardCalculator = new RewardCalculator();
  }

  processBlock(block: Block): boolean {
    // 1. Validate the block using the BlockValidator
    if (!this.blockValidator.validateBlock(block)) {
      return false;
    }

    // 2. Calculate rewards for the block, including uncles
    this.rewardCalculator.calculateRewards(block);

    // 3. Add the block to the chain
    // ...

    return true;
  }
}
import { BigNumber } from 'bignumber.js';
import { Account } from '../account';
import { Block } from '../block';
import { Transaction } from '../transaction';
import { Stake } from './stake';

export class StakingManager {
  private stakes: Map<string, Stake> = new Map();

  stakeTokens(account: Account, amount: BigNumber, duration: number): Stake {
    const startBlock = Block.getCurrentBlock();
    const endBlock = startBlock.clone().addBlocks(duration);
    const rewardRate = new BigNumber(0.05); // 5% annual reward rate
    const stake = new Stake(account, amount, startBlock, endBlock, rewardRate);
    this.stakes.set(account.address, stake);
    return stake;
  }

  unstakeTokens(account: Account): BigNumber {
    const stake = this.stakes.get(account.address);
    if (!stake) {
      return new BigNumber(0);
    }
    const currentBlock = Block.getCurrentBlock();
    const reward = stake.calculateReward(currentBlock);
    this.stakes.delete(account.address);
    return stake.amount.plus(reward);
  }

  getStakedAmount(account: Account): BigNumber {
    const stake = this.stakes.get(account.address);
    return stake ? stake.amount : new BigNumber(0);
  }

  getStakeReward(account: Account): BigNumber {
    const stake = this.stakes.get(account.address);
    if (!stake) {
      return new BigNumber(0);
    }
    const currentBlock = Block.getCurrentBlock();
    return stake.calculateReward(currentBlock);
  }
}
import { BigNumber } from 'bignumber.js';
import { StakingManager, Stake } from './stake';

export class StakingService {
  private stakingManager: StakingManager = new StakingManager();

  stake(address: string, amount: BigNumber): void {
    const stake = this.stakingManager.getStake(address);
    stake.amount = stake.amount.plus(amount);
    stake.lastUpdateTimestamp = Date.now();
    this.stakingManager.updateStake(address, stake);
  }

  unstake(address: string, amount: BigNumber): void {
    const stake = this.stakingManager.getStake(address);
    stake.amount = stake.amount.minus(amount);
    stake.lastUpdateTimestamp = Date.now();
    this.stakingManager.updateStake(address, stake);
  }

  claimRewards(address: string): BigNumber {
    const stake = this.stakingManager.getStake(address);
    const rewards = stake.accumulatedRewards;
    stake.accumulatedRewards = new BigNumber(0);
    this.stakingManager.updateStake(address, stake);
    return rewards;
  }

  updateRewards(address: string, rewardRate: BigNumber): void {
    const stake = this.stakingManager.getStake(address);
    const timeSinceLastUpdate = Date.now() - stake.lastUpdateTimestamp;
    const newRewards = rewardRate.multipliedBy(timeSinceLastUpdate / 1000); // assume rewards per second
    stake.accumulatedRewards = stake.accumulatedRewards.plus(newRewards);
    stake.lastUpdateTimestamp = Date.now();
    this.stakingManager.updateStake(address, stake);
  }
}
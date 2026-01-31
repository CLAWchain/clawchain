import { BigNumber } from 'ethers';

export class StakingRewardsManager {
  private delegations: Map<string, BigNumber> = new Map();
  private totalStaked: BigNumber = BigNumber.from(0);
  private rewardRate: BigNumber = BigNumber.from(0);

  constructor(rewardRate: BigNumber) {
    this.rewardRate = rewardRate;
  }

  stake(address: string, amount: BigNumber): void {
    this.delegations.set(address, this.delegations.get(address)?.add(amount) || amount);
    this.totalStaked = this.totalStaked.add(amount);
  }

  unstake(address: string, amount: BigNumber): void {
    const currentStake = this.delegations.get(address) || BigNumber.from(0);
    const newStake = currentStake.sub(amount);
    this.delegations.set(address, newStake);
    this.totalStaked = this.totalStaked.sub(amount);
  }

  claimRewards(address: string): BigNumber {
    const currentStake = this.delegations.get(address) || BigNumber.from(0);
    const rewards = currentStake.mul(this.rewardRate).div(100);
    this.delegations.set(address, currentStake.add(rewards));
    return rewards;
  }

  getTotalStaked(): BigNumber {
    return this.totalStaked;
  }
}
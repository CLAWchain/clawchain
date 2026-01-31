import { StakingContract } from './staking';
import { BigNumber } from 'bignumber.js';

export class StakingModule {
  private stakingContract = new StakingContract();

  stake(amount: BigNumber, delegateTo?: string) {
    this.stakingContract.stake(amount, delegateTo);
  }

  withdraw(amount: BigNumber, from: string) {
    this.stakingContract.withdraw(amount, from);
  }

  setRewardRate(rate: BigNumber) {
    this.stakingContract.setRewardRate(rate);
  }
}
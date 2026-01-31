import { BigNumber } from 'bignumber.js';

export interface Stake {
  amount: BigNumber;
  delegatedTo?: string; // validator address
  lastUpdateTimestamp: number;
  accumulatedRewards: BigNumber;
}

export class StakingManager {
  private stakes: Map<string, Stake> = new Map(); // user address -> stake

  getStake(address: string): Stake {
    return this.stakes.get(address) || { amount: new BigNumber(0), lastUpdateTimestamp: 0, accumulatedRewards: new BigNumber(0) };
  }

  updateStake(address: string, stake: Stake): void {
    this.stakes.set(address, stake);
  }

  delegate(address: string, validatorAddress: string): void {
    const stake = this.getStake(address);
    stake.delegatedTo = validatorAddress;
    this.updateStake(address, stake);
  }
}
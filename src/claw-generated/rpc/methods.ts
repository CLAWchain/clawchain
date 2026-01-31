import { StakingStateManager } from '../StakingStateManager';
import { Account } from '../account';
import { BigNumber } from 'ethers';

export class RpcMethods {
  private stakingStateManager: StakingStateManager;

  constructor(stakingStateManager: StakingStateManager) {
    this.stakingStateManager = stakingStateManager;
  }

  async getStakerBalance(account: Account): Promise<string> {
    const balance = await this.stakingStateManager.getStakerBalance(account);
    return balance.toString();
  }

  async stake(account: Account, validator: string, amount: string): Promise<void> {
    const amountBN = BigNumber.from(amount);
    await this.stakingStateManager.setStakerBalance(account, amountBN);
    await this.stakingStateManager.setDelegation(account, validator);
  }

  async unstake(account: Account, validator: string, amount: string): Promise<void> {
    const amountBN = BigNumber.from(amount);
    await this.stakingStateManager.setStakerBalance(account, amountBN.neg());
    await this.stakingStateManager.setDelegation(account, '');
  }

  async claimRewards(account: Account, validator: string): Promise<string> {
    const lastClaimTimestamp = await this.stakingStateManager.getLastClaimTimestamp(validator);
    const rewards = await this.calculateRewards(validator, lastClaimTimestamp);
    await this.stakingStateManager.setLastClaimTimestamp(validator, Math.floor(Date.now() / 1000));
    return rewards.toString();
  }

  private async calculateRewards(validator: string, lastClaimTimestamp: number): Promise<BigNumber> {
    const totalStaked = await this.stakingStateManager.getTotalStaked();
    const timeSinceLastClaim = Math.max(0, Math.floor(Date.now() / 1000) - lastClaimTimestamp);
    const annualRewards = totalStaked.mul(10).div(100); // 10% annual interest rate
    const rewards = annualRewards.mul(timeSinceLastClaim).div(365 * 24 * 60 * 60);
    return rewards;
  }
}
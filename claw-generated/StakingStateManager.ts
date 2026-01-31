import { StateManager } from './StateManager';
import { Account } from './account';

export class StakingStateManager {
  private stateManager: StateManager;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
  }

  async stake(account: Account, amount: bigint): Promise<void> {
    // Update account's staked balance
    account.stakedBalance += amount;
    await this.stateManager.updateAccount(account);
  }

  async unstake(account: Account, amount: bigint): Promise<void> {
    // Update account's staked balance
    account.stakedBalance -= amount;
    await this.stateManager.updateAccount(account);
  }

  async claimRewards(account: Account): Promise<bigint> {
    // Calculate rewards based on staked balance and time
    const rewards = this.calculateRewards(account);

    // Update account's rewards balance
    account.rewardsBalance += rewards;
    await this.stateManager.updateAccount(account);

    return rewards;
  }

  private calculateRewards(account: Account): bigint {
    // Implement reward calculation logic based on staked balance and time
    // This is a placeholder, the actual logic will be more complex
    return account.stakedBalance * BigInt(10);
  }
}
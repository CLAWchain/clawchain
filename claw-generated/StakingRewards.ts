import { StakingStateManager } from './StakingStateManager';
import { Account } from './account';

export class StakingRewards {
  private stakingStateManager: StakingStateManager;

  constructor(stakingStateManager: StakingStateManager) {
    this.stakingStateManager = stakingStateManager;
  }

  async claimRewards(account: Account): Promise<bigint> {
    return await this.stakingStateManager.claimRewards(account);
  }

  async distributeRewards(): Promise<void> {
    // Iterate through all accounts and distribute rewards
    // This is a placeholder, the actual logic will be more complex
    const allAccounts = await this.stakingStateManager.getAllAccounts();
    for (const account of allAccounts) {
      const rewards = await this.stakingStateManager.claimRewards(account);
      console.log(`Distributed ${rewards} rewards to ${account.address}`);
    }
  }
}
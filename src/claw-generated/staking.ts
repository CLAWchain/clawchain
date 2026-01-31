import { BigNumber } from 'ethers';
import { Account } from './account';
import { StateManager } from './StateManager';

class StakingContract {
  private stateManager: StateManager;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
  }

  async stake(amount: BigNumber, delegateTo?: string): Promise<void> {
    // 1. Validate the stake amount
    // 2. Update the staker's balance in the state trie
    // 3. Track the delegation, if provided
    // 4. Emit a staking event
  }

  async withdraw(amount: BigNumber): Promise<void> {
    // 1. Validate the withdrawal amount
    // 2. Update the staker's balance in the state trie
    // 3. Emit a withdrawal event
  }

  async claimRewards(): Promise<void> {
    // 1. Calculate the staker's rewards based on their stake and the total staked
    // 2. Transfer the rewards to the staker's account
    // 3. Emit a rewards event
  }

  private calculateRewards(staker: Account): BigNumber {
    // 1. Get the staker's stake amount
    // 2. Get the total staked amount
    // 3. Calculate the rewards based on the stake percentage and the reward rate
    // 4. Return the rewards amount
  }
}

export { StakingContract };
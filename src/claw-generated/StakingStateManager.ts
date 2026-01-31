import { BigNumber } from 'ethers';
import { StateManager } from './StateManager';
import { Account } from './account';

class StakingStateManager {
  private stateManager: StateManager;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
  }

  async getTotalStaked(): Promise<BigNumber> {
    // 1. Retrieve the total staked amount from the state trie
    return BigNumber.from(0);
  }

  async getStakerBalance(staker: Account): Promise<BigNumber> {
    // 1. Retrieve the staker's balance from the state trie
    return BigNumber.from(0);
  }

  async setStakerBalance(staker: Account, amount: BigNumber): Promise<void> {
    // 1. Update the staker's balance in the state trie
  }

  async setDelegation(staker: Account, delegateTo: string): Promise<void> {
    // 1. Store the delegation information in the state trie
  }

  async getDelegation(staker: Account): Promise<string | undefined> {
    // 1. Retrieve the staker's delegation from the state trie
    return undefined;
  }
}

export { StakingStateManager };
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
    const totalStakedKey = 'totalStaked';
    const totalStaked = await this.stateManager.get(totalStakedKey);
    return totalStaked ? BigNumber.from(totalStaked) : BigNumber.from(0);
  }

  async getStakerBalance(staker: Account): Promise<BigNumber> {
    // 1. Retrieve the staker's balance from the state trie
    const stakerBalanceKey = `stakerBalance:${staker.address}`;
    const balance = await this.stateManager.get(stakerBalanceKey);
    return balance ? BigNumber.from(balance) : BigNumber.from(0);
  }

  async setStakerBalance(staker: Account, amount: BigNumber): Promise<void> {
    // 1. Update the staker's balance in the state trie
    const stakerBalanceKey = `stakerBalance:${staker.address}`;
    await this.stateManager.set(stakerBalanceKey, amount.toString());
  }

  async setDelegation(staker: Account, delegateTo: string): Promise<void> {
    // 1. Store the delegation information in the state trie
    const delegationKey = `delegation:${staker.address}`;
    await this.stateManager.set(delegationKey, delegateTo);
  }

  async getDelegation(staker: Account): Promise<string | undefined> {
    // 1. Retrieve the staker's delegation from the state trie
    const delegationKey = `delegation:${staker.address}`;
    const delegation = await this.stateManager.get(delegationKey);
    return delegation || undefined;
  }

  async setLastClaimTimestamp(validator: string, timestamp: number): Promise<void> {
    // 1. Store the last claim timestamp for the validator
    const lastClaimKey = `lastClaimTimestamp:${validator}`;
    await this.stateManager.set(lastClaimKey, timestamp.toString());
  }

  async getLastClaimTimestamp(validator: string): Promise<number> {
    // 1. Retrieve the last claim timestamp for the validator
    const lastClaimKey = `lastClaimTimestamp:${validator}`;
    const timestamp = await this.stateManager.get(lastClaimKey);
    return timestamp ? parseInt(timestamp) : 0;
  }
}

export { StakingStateManager };
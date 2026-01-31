import { Account, AccountState } from './state/account';
import { Trie } from './state/Trie';
import { BigNumber } from 'ethers';
import { StakingRewardsManager } from './staking';

export class State {
  private accountTrie: Trie;
  private accountState: AccountState;
  private stakingRewardsManager: StakingRewardsManager;

  constructor(rewardRate: BigNumber) {
    this.accountTrie = new Trie();
    this.accountState = new AccountState();
    this.stakingRewardsManager = new StakingRewardsManager(rewardRate);
  }

  getAccount(address: Buffer): Account {
    const addressHex = address.toString('hex');
    const account = this.accountState.getAccount(address);
    if (account) {
      return account;
    }

    const newAccount = new Account(address, 0, BigNumber.from(0), 0);
    this.accountState.addAccount(newAccount);
    this.accountTrie.set(address, newAccount.rlp());
    return newAccount;
  }

  stakeTokens(address: Buffer, amount: BigNumber): void {
    const account = this.getAccount(address);
    this.stakingRewardsManager.stake(account.pubkey.toString(), amount);
    this.accountState.updateBalance(
      account.pubkey,
      account.lamports,
      account.stakedBalance.add(amount),
      account.lastClaimTime
    );
  }

  unstakeTokens(address: Buffer, amount: BigNumber): void {
    const account = this.getAccount(address);
    this.stakingRewardsManager.unstake(account.pubkey.toString(), amount);
    this.accountState.updateBalance(
      account.pubkey,
      account.lamports,
      account.stakedBalance.sub(amount),
      account.lastClaimTime
    );
  }

  claimRewards(address: Buffer): BigNumber {
    const account = this.getAccount(address);
    const rewards = this.stakingRewardsManager.claimRewards(account.pubkey.toString());
    this.accountState.updateBalance(
      account.pubkey,
      account.lamports.add(rewards.toNumber()),
      account.stakedBalance,
      Date.now()
    );
    return rewards;
  }

  getTotalStaked(): BigNumber {
    return this.stakingRewardsManager.getTotalStaked();
  }

  commitState(): void {
    this.accountTrie.commit();
  }

  getStateRoot(): Buffer {
    return this.accountTrie.root;
  }
}
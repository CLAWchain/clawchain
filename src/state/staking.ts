import { Account } from "./account";
import { TransactionsDb, TransactionSignature } from "./transactions_db";
import { Hash } from "../core/types";

export class StakingAccount extends Account {
  stakedBalance: number;
  delegation: Hash | null;
  rewardsPending: number;

  constructor(
    pubkey: Uint8Array,
    lamports: number,
    owner: Uint8Array,
    executable: boolean,
    stakedBalance: number,
    delegation: Hash | null,
    rewardsPending: number
  ) {
    super(pubkey, lamports, owner, executable);
    this.stakedBalance = stakedBalance;
    this.delegation = delegation;
    this.rewardsPending = rewardsPending;
  }
}

export class StakingDb {
  private trie: TransactionsDb;

  constructor(trie: TransactionsDb) {
    this.trie = trie;
  }

  async getStakingAccount(address: Uint8Array): Promise<StakingAccount | null> {
    const account = await this.trie.getAccount(address);
    if (!account) {
      return null;
    }

    const { stakedBalance, delegation, rewardsPending } = await this.getStakingData(address);
    return new StakingAccount(
      account.pubkey,
      account.lamports,
      account.owner,
      account.executable,
      stakedBalance,
      delegation,
      rewardsPending
    );
  }

  async getStakingData(address: Uint8Array): Promise<{
    stakedBalance: number;
    delegation: Hash | null;
    rewardsPending: number;
  }> {
    // Fetch staking-related data from the transactions database
    const stakingTransactions = await this.trie.getStakingTransactions(address);
    let stakedBalance = 0;
    let delegation: Hash | null = null;
    let rewardsPending = 0;

    for (const tx of stakingTransactions) {
      switch (tx.type) {
        case "stake":
          stakedBalance += tx.amount;
          break;
        case "withdraw":
          stakedBalance -= tx.amount;
          break;
        case "delegate":
          delegation = tx.delegateTo;
          break;
        case "claim_rewards":
          rewardsPending += tx.amount;
          break;
      }
    }

    return { stakedBalance, delegation, rewardsPending };
  }

  async addStakingTransaction(
    signature: Uint8Array,
    slot: number,
    blockTime: number,
    address: Uint8Array,
    type: "stake" | "withdraw" | "delegate" | "claim_rewards",
    amount?: number,
    delegateTo?: Hash
  ): Promise<void> {
    await this.trie.addStakingTransaction(
      signature,
      slot,
      blockTime,
      address,
      type,
      amount,
      delegateTo
    );
  }
}
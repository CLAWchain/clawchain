import { ByteArray, Hash } from "./types";
import { Contract, Event } from "./contract";
import { StakingDb, StakingAccount } from "../state/staking";

export class StakingContract extends Contract {
  private stakingDb: StakingDb;

  constructor(
    address: Hash,
    code: ByteArray,
    state: Map&lt;string, any&gt;,
    stakingDb: StakingDb
  ) {
    super(address, code, state);
    this.stakingDb = stakingDb;
  }

  async stake(amount: number): Promise&lt;void&gt; {
    const account = await this.stakingDb.getStakingAccount(this.address);
    if (!account) {
      throw new Error("Account not found");
    }

    account.stakedBalance += amount;
    account.lamports -= amount;

    await this.stakingDb.addStakingTransaction(
      this.address,
      this.currentSlot,
      Date.now(),
      this.address,
      "stake",
      amount
    );

    this.emit("Staked", { amount });
  }

  async withdraw(amount: number): Promise&lt;void&gt; {
    const account = await this.stakingDb.getStakingAccount(this.address);
    if (!account) {
      throw new Error("Account not found");
    }

    if (account.stakedBalance < amount) {
      throw new Error("Insufficient staked balance");
    }

    account.stakedBalance -= amount;
    account.lamports += amount;

    await this.stakingDb.addStakingTransaction(
      this.address,
      this.currentSlot,
      Date.now(),
      this.address,
      "withdraw",
      amount
    );

    this.emit("Withdrew", { amount });
  }

  async delegate(delegateTo: Hash): Promise&lt;void&gt; {
    const account = await this.stakingDb.getStakingAccount(this.address);
    if (!account) {
      throw new Error("Account not found");
    }

    account.delegation = delegateTo;

    await this.stakingDb.addStakingTransaction(
      this.address,
      this.currentSlot,
      Date.now(),
      this.address,
      "delegate",
      undefined,
      delegateTo
    );

    this.emit("Delegated", { delegateTo });
  }

  async claimRewards(): Promise&lt;void&gt; {
    const account = await this.stakingDb.getStakingAccount(this.address);
    if (!account) {
      throw new Error("Account not found");
    }

    const rewards = account.rewardsPending;
    account.lamports += rewards;
    account.rewardsPending = 0;

    await this.stakingDb.addStakingTransaction(
      this.address,
      this.currentSlot,
      Date.now(),
      this.address,
      "claim_rewards",
      rewards
    );

    this.emit("RewardsClaimed", { rewards });
  }
}
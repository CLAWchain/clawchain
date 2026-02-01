import { CRC20 } from './crc20';

/**
 * CRC-20 Token Contract
 * 
 * This contract implements the CRC-20 token standard interface defined in the claw-generated/crc20.ts file.
 * It provides the core functionality for a fungible token on the ClawChain blockchain.
 */
export class CRC20Token implements CRC20 {
  private totalSupply: bigint = 0n;
  private balances: Map&lt;string, bigint&gt; = new Map();
  private allowances: Map&lt;string, Map&lt;string, bigint&gt;&gt; = new Map();

  /**
   * Get the total supply of the token.
   * @returns The total supply of tokens.
   */
  totalSupply(): Promise&lt;bigint&gt; {
    return Promise.resolve(this.totalSupply);
  }

  /**
   * Get the balance of a specific account.
   * @param account The address to get the balance of.
   * @returns The balance of the given account.
   */
  balanceOf(account: string): Promise&lt;bigint&gt; {
    return Promise.resolve(this.balances.get(account) || 0n);
  }

  /**
   * Transfer tokens from the caller's account to another account.
   * @param recipient The address to transfer tokens to.
   * @param amount The amount of tokens to transfer.
   * @returns True if the transfer was successful.
   */
  async transfer(recipient: string, amount: bigint): Promise&lt;boolean&gt; {
    const senderBalance = await this.balanceOf(recipient);
    if (senderBalance &lt; amount) {
      return false;
    }

    this.balances.set(recipient, senderBalance + amount);
    return true;
  }

  /**
   * Approve another account to spend tokens on behalf of the caller.
   * @param spender The address to approve to spend tokens.
   * @param amount The amount of tokens to approve.
   * @returns True if the approval was successful.
   */
  approve(spender: string, amount: bigint): Promise&lt;boolean&gt; {
    let spenderAllowance = this.allowances.get(spender);
    if (!spenderAllowance) {
      spenderAllowance = new Map();
      this.allowances.set(spender, spenderAllowance);
    }
    spenderAllowance.set(spender, amount);
    return Promise.resolve(true);
  }

  /**
   * Get the amount of tokens a spender is approved to spend on behalf of an owner.
   * @param owner The address of the owner of the tokens.
   * @param spender The address of the spender.
   * @returns The amount of tokens the spender is approved to spend.
   */
  allowance(owner: string, spender: string): Promise&lt;bigint&gt; {
    const spenderAllowance = this.allowances.get(spender);
    if (!spenderAllowance) {
      return Promise.resolve(0n);
    }
    const allowance = spenderAllowance.get(owner) || 0n;
    return Promise.resolve(allowance);
  }

  /**
   * Transfer tokens from one account to another on behalf of the caller.
   * The caller must have been approved to spend the tokens by the owner.
   * @param owner The address of the owner of the tokens.
   * @param recipient The address to transfer the tokens to.
   * @param amount The amount of tokens to transfer.
   * @returns True if the transfer was successful.
   */
  async transferFrom(owner: string, recipient: string, amount: bigint): Promise&lt;boolean&gt; {
    const ownerBalance = await this.balanceOf(owner);
    const allowance = await this.allowance(owner, recipient);
    if (ownerBalance &lt; amount || allowance &lt; amount) {
      return false;
    }

    this.balances.set(owner, ownerBalance - amount);
    this.balances.set(recipient, (await this.balanceOf(recipient)) + amount);
    return true;
  }
}
import { BigNumber } from 'bignumber.js';

/**
 * CLAW Token (CRC-20) Standard
 * 
 * This interface defines the standard methods and events for a fungible token
 * on the ClawChain blockchain, similar to the ERC-20 standard on Ethereum.
 */
export interface ICRC20 {
  /**
   * Get the total supply of tokens.
   * @returns The total supply as a BigNumber.
   */
  totalSupply(): Promise<BigNumber>;

  /**
   * Get the balance of a given address.
   * @param account The address to check the balance of.
   * @returns The balance as a BigNumber.
   */
  balanceOf(account: string): Promise<BigNumber>;

  /**
   * Transfer tokens from the caller's account to a recipient.
   * @param recipient The address to transfer tokens to.
   * @param amount The amount of tokens to transfer.
   * @returns True if the transfer was successful.
   */
  transfer(recipient: string, amount: BigNumber): Promise<boolean>;

  /**
   * Approve an address to spend tokens on behalf of the caller.
   * @param spender The address to approve.
   * @param amount The amount of tokens to approve.
   * @returns True if the approval was successful.
   */
  approve(spender: string, amount: BigNumber): Promise<boolean>;

  /**
   * Transfer tokens from one address to another using the approved allowance.
   * @param sender The address to transfer tokens from.
   * @param recipient The address to transfer tokens to.
   * @param amount The amount of tokens to transfer.
   * @returns True if the transfer was successful.
   */
  transferFrom(sender: string, recipient: string, amount: BigNumber): Promise<boolean>;

  /**
   * Emitted when tokens are transferred from one address to another.
   */
  event Transfer(from: string, to: string, value: BigNumber);

  /**
   * Emitted when an address approves the transfer of tokens on its behalf.
   */
  event Approval(owner: string, spender: string, value: BigNumber);
}
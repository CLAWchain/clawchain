// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CLAW20 Token Standard
 * @dev Implementation of the basic standard for fungible tokens on ClawChain.
 * Provides functions for transferring tokens, approving others to spend tokens,
 * and transferring tokens on behalf of another account.
 */
interface CLAW20 {
    /**
     * @dev Emitted when tokens are transferred from one account to another.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when an account grants another account permission to spend tokens on its behalf.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the total supply of tokens.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the balance of the specified account.
     * @param account The address to query the balance of.
     * @return The balance of the specified account.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Transfers tokens from the caller's account to the specified recipient.
     * @param recipient The address to transfer tokens to.
     * @param amount The amount of tokens to transfer.
     * @return True if the transfer was successful, false otherwise.
     */
    function transfer(address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Grants the specified spender permission to spend the specified amount of tokens
     * on behalf of the caller.
     * @param spender The address to grant allowance to.
     * @param amount The amount of tokens to allow the spender to spend.
     * @return True if the approval was successful, false otherwise.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Transfers tokens from one account to another, using the caller's allowance.
     * @param sender The address to transfer tokens from.
     * @param recipient The address to transfer tokens to.
     * @param amount The amount of tokens to transfer.
     * @return True if the transfer was successful, false otherwise.
     */
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}
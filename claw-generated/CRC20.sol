// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CRC-20 Token Standard
 * @dev Implementation of the basic standard for fungible tokens on ClawChain.
 * Based on the ERC-20 standard, with a few minor changes to fit the ClawChain ecosystem.
 */
contract CRC20 {
    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // Token Metadata
    string public name;
    string public symbol;
    uint8 public decimals;

    // Token State
    mapping(address =&gt; uint256) public balanceOf;
    mapping(address =&gt; mapping(address =&gt; uint256)) public allowance;
    uint256 public totalSupply;

    /**
     * @dev Constructor to initialize the token metadata.
     * @param _name The name of the token.
     * @param _symbol The symbol of the token.
     * @param _decimals The number of decimal places the token supports.
     */
    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }

    /**
     * @dev Transfers tokens from the caller's account to the specified address.
     * @param recipient The address to transfer tokens to.
     * @param amount The amount of tokens to transfer.
     * @return bool True if the transfer was successful.
     */
    function transfer(address recipient, uint256 amount) public virtual returns (bool) {
        require(recipient != address(0), "CRC20: cannot transfer to the zero address");
        require(amount &lt;= balanceOf[msg.sender], "CRC20: insufficient balance");

        balanceOf[msg.sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    /**
     * @dev Allows the spender to withdraw from the caller's account multiple times, up to the value amount.
     * @param spender The address to approve for spending.
     * @param amount The amount of tokens to be approved for spending.
     * @return bool True if the approval was successful.
     */
    function approve(address spender, uint256 amount) public virtual returns (bool) {
        require(spender != address(0), "CRC20: cannot approve the zero address");
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /**
     * @dev Transfers tokens from the specified address to the recipient, provided the caller has sufficient allowance.
     * @param sender The address to transfer tokens from.
     * @param recipient The address to transfer tokens to.
     * @param amount The amount of tokens to transfer.
     * @return bool True if the transfer was successful.
     */
    function transferFrom(address sender, address recipient, uint256 amount) public virtual returns (bool) {
        require(recipient != address(0), "CRC20: cannot transfer to the zero address");
        require(amount &lt;= balanceOf[sender], "CRC20: insufficient balance");
        require(amount &lt;= allowance[sender][msg.sender], "CRC20: insufficient allowance");

        balanceOf[sender] -= amount;
        balanceOf[recipient] += amount;
        allowance[sender][msg.sender] -= amount;
        emit Transfer(sender, recipient, amount);
        return true;
    }
}
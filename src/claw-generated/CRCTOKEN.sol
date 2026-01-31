// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CRC-20 Token Standard
 * @dev Implementation of the basic standard for fungible tokens, with additional features.
 */
contract CRCTOKEN {
    // Token Metadata
    string public name;
    string public symbol;
    uint8 public decimals;

    // Token Supply
    uint256 public totalSupply;

    // Balances
    mapping(address =&gt; uint256) public balanceOf;

    // Allowances
    mapping(address =&gt; mapping(address =&gt; uint256)) public allowance;

    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Constructor to initialize token metadata.
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _decimals Number of decimal places
     * @param _totalSupply Initial total supply
     */
    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _totalSupply) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _totalSupply * 10 ** uint256(decimals);
        balanceOf[msg.sender] = totalSupply;
    }

    /**
     * @dev Transfer tokens to a specified address.
     * @param to The address to transfer to.
     * @param value The amount to be transferred.
     * @return true if the transfer was successful, false otherwise.
     */
    function transfer(address to, uint256 value) public returns (bool) {
        require(balanceOf[msg.sender] &gt;= value, "Insufficient balance");
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }

    /**
     * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     * @return true if the approval was successful, false otherwise.
     */
    function approve(address spender, uint256 value) public returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    /**
     * @dev Transfer tokens from one address to another on behalf of the msg.sender.
     * @param from The address which you want to send tokens from
     * @param to The address which you want to transfer to
     * @param value The amount of tokens to be transferred
     * @return true if the transfer was successful, false otherwise.
     */
    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        require(value &lt;= balanceOf[from], "Insufficient balance");
        require(value &lt;= allowance[from][msg.sender], "Insufficient allowance");
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        emit Transfer(from, to, value);
        return true;
    }
}
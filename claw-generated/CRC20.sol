// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CLAW Token Standard (CRC-20)
 * @dev Implementation of the basic standard for fungible tokens, with extra features.
 */
contract CRC20 {
    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 value);
    event Burn(address indexed from, uint256 value);

    // Token Metadata
    string public name;
    string public symbol;
    uint8 public decimals;

    // Token State
    mapping(address =&gt; uint256) public balanceOf;
    mapping(address =&gt; mapping(address =&gt; uint256)) public allowance;
    uint256 public totalSupply;

    /**
     * @dev Constructor to initialize token metadata.
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _decimals Number of decimal places
     */
    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }

    /**
     * @dev Transfer tokens from the caller to a recipient.
     * @param to The address to transfer to.
     * @param value The amount to be transferred.
     * @return bool true if the transfer was successful, false otherwise.
     */
    function transfer(address to, uint256 value) public virtual returns (bool) {
        require(balanceOf[msg.sender] &gt;= value, "Insufficient balance");
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }

    /**
     * @dev Approve the passed address to spend the specified amount of tokens on behalf of the caller.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     * @return bool true if the approval was successful, false otherwise.
     */
    function approve(address spender, uint256 value) public virtual returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    /**
     * @dev Transfer tokens from one address to another on behalf of the caller.
     * @param from The address to send tokens from.
     * @param to The address to transfer to.
     * @param value The amount of tokens to be transferred.
     * @return bool true if the transfer was successful, false otherwise.
     */
    function transferFrom(address from, address to, uint256 value) public virtual returns (bool) {
        require(value &lt;= balanceOf[from], "Insufficient balance");
        require(value &lt;= allowance[from][msg.sender], "Insufficient allowance");
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        emit Transfer(from, to, value);
        return true;
    }

    /**
     * @dev Mint new tokens and add them to the total supply.
     * @param to The address to receive the minted tokens.
     * @param value The amount of tokens to mint.
     */
    function mint(address to, uint256 value) public virtual {
        totalSupply += value;
        balanceOf[to] += value;
        emit Mint(to, value);
    }

    /**
     * @dev Burn tokens, reducing the total supply.
     * @param from The address to burn tokens from.
     * @param value The amount of tokens to burn.
     */
    function burn(address from, uint256 value) public virtual {
        require(balanceOf[from] &gt;= value, "Insufficient balance");
        balanceOf[from] -= value;
        totalSupply -= value;
        emit Burn(from, value);
    }
}
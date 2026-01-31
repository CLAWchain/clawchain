// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CLAW Token Standard (CRC-20)
 * @dev Implementation of the basic standard for fungible tokens on ClawChain.
 */
contract CLAW {
    // Token metadata
    string public name;
    string public symbol;
    uint8 public decimals;

    // Token balances
    mapping(address =&gt; uint256) private _balances;
    mapping(address =&gt; mapping(address =&gt; uint256)) private _allowances;

    uint256 private _totalSupply;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }

    /**
     * @dev Returns the total supply of the token.
     */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev Returns the balance of the specified address.
     * @param account The address to query the balance of.
     * @return The balance of the specified address.
     */
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev Transfers tokens to a specified address.
     * @param to The address to transfer to.
     * @param amount The amount to be transferred.
     * @return A boolean value indicating whether the operation succeeded.
     */
    function transfer(address to, uint256 amount) public returns (bool) {
        _transfer(_msgSender(), to, amount);
        return true;
    }

    /**
     * @dev Sets the allowance of the specified spender over the caller's tokens.
     * @param spender The address to allow to spend the specified amount.
     * @param amount The amount of tokens to be approved for spending.
     * @return A boolean value indicating whether the operation succeeded.
     */
    function approve(address spender, uint256 amount) public returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    /**
     * @dev Transfers tokens from one address to another.
     * @param from The address to transfer from.
     * @param to The address to transfer to.
     * @param amount The amount of tokens to be transferred.
     * @return A boolean value indicating whether the operation succeeded.
     */
    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        _transfer(from, to, amount);
        _approve(from, _msgSender(), _allowances[from][_msgSender()] - amount);
        return true;
    }

    /**
     * @dev Returns the amount of tokens that the spender is still allowed to withdraw from the owner.
     * @param owner The address of the account owning tokens.
     * @param spender The address of the account able to transfer the tokens.
     * @return The remaining number of tokens that the spender is allowed to spend.
     */
    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }

    function _transfer(address from, address to, uint256 amount) internal virtual {
        require(from != address(0), "CLAW: transfer from the zero address");
        require(to != address(0), "CLAW: transfer to the zero address");
        require(amount &gt; 0, "CLAW: transfer amount must be greater than zero");

        _beforeTokenTransfer(from, to, amount);

        _balances[from] -= amount;
        _balances[to] += amount;

        emit Transfer(from, to, amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal virtual {
        require(owner != address(0), "CLAW: approve from the zero address");
        require(spender != address(0), "CLAW: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual {}
}
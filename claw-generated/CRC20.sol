// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CRC20 Token Standard
 * @dev Implementation of the basic standard for fungible tokens, as defined in ERC-20.
 * 
 * This contract provides the following functionality:
 * - Transfer tokens from one address to another
 * - Allow other addresses to spend tokens on behalf of the owner
 * - Query the total supply of tokens
 * - Query the balance of a given address
 */
contract CRC20 {
    // Token metadata
    string public name;
    string public symbol;
    uint8 public decimals;

    // Token state
    mapping(address =&gt; uint256) private _balances;
    mapping(address =&gt; mapping(address =&gt; uint256)) private _allowances;
    uint256 private _totalSupply;

    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Constructor to initialize the token.
     * @param _name The name of the token.
     * @param _symbol The symbol of the token.
     * @param _decimals The number of decimal places the token has.
     * @param _initialSupply The initial total supply of the token.
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _initialSupply
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        _totalSupply = _initialSupply * 10 ** uint256(decimals);
        _balances[msg.sender] = _totalSupply;
        emit Transfer(address(0), msg.sender, _totalSupply);
    }

    /**
     * @dev Transfers tokens from the caller's account to the specified recipient.
     * @param recipient The address to receive the tokens.
     * @param amount The amount of tokens to transfer.
     * @return bool True if the transfer was successful.
     */
    function transfer(address recipient, uint256 amount) public virtual returns (bool) {
        require(recipient != address(0), "CRC20: cannot transfer to the zero address");
        require(amount <= _balances[msg.sender], "CRC20: transfer amount exceeds balance");

        _balances[msg.sender] -= amount;
        _balances[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    /**
     * @dev Approves the specified spender to spend the specified amount of tokens on behalf of the caller.
     * @param spender The address to approve.
     * @param amount The amount of tokens to approve.
     * @return bool True if the approval was successful.
     */
    function approve(address spender, uint256 amount) public virtual returns (bool) {
        require(spender != address(0), "CRC20: cannot approve the zero address");

        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /**
     * @dev Transfers tokens from the specified owner to the specified recipient, up to the amount approved for the sender.
     * @param owner The address that owns the tokens.
     * @param recipient The address to receive the tokens.
     * @param amount The amount of tokens to transfer.
     * @return bool True if the transfer was successful.
     */
    function transferFrom(address owner, address recipient, uint256 amount) public virtual returns (bool) {
        require(recipient != address(0), "CRC20: cannot transfer to the zero address");
        require(amount <= _balances[owner], "CRC20: transfer amount exceeds balance");
        require(amount <= _allowances[owner][msg.sender], "CRC20: transfer amount exceeds allowance");

        _balances[owner] -= amount;
        _balances[recipient] += amount;
        _allowances[owner][msg.sender] -= amount;

        emit Transfer(owner, recipient, amount);
        emit Approval(owner, msg.sender, _allowances[owner][msg.sender]);
        return true;
    }

    /**
     * @dev Returns the total supply of tokens.
     * @return uint256 The total supply of tokens.
     */
    function totalSupply() public view virtual returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev Returns the balance of the specified address.
     * @param account The address to query.
     * @return uint256 The balance of the specified address.
     */
    function balanceOf(address account) public view virtual returns (uint256) {
        return _balances[account];
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CLAW Token Standard (CRC-20)
 * @dev Implementation of the basic standard for fungible tokens, following the ERC-20 specification.
 */
contract CLAW {
    // Token metadata
    string public name;
    string public symbol;
    uint8 public decimals;

    // Token balances
    mapping(address =&gt; uint256) private _balances;
    uint256 private _totalSupply;

    // Token approval
    mapping(address =&gt; mapping(address =&gt; uint256)) private _allowances;

    /**
     * @dev Initializes the contract with the given name, symbol, and decimals.
     * @param _name The name of the token.
     * @param _symbol The symbol of the token.
     * @param _decimals The number of decimal places the token has.
     */
    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }

    /**
     * @dev Returns the total supply of the token.
     * @return The total supply of the token.
     */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev Returns the token balance of the given address.
     * @param account The address to query the balance of.
     * @return The balance of the specified address.
     */
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev Transfers a specified amount of tokens to a given address.
     * @param recipient The address to transfer tokens to.
     * @param amount The amount of tokens to be transferred.
     * @return A boolean value indicating whether the operation succeeded.
     */
    function transfer(address recipient, uint256 amount) public returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    /**
     * @dev Sets the allowance of a spender to a specified amount of tokens.
     * @param spender The address to allow to spend tokens.
     * @param amount The amount of tokens to be allowed.
     * @return A boolean value indicating whether the operation succeeded.
     */
    function approve(address spender, uint256 amount) public returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    /**
     * @dev Transfers a specified amount of tokens from one address to another, given the caller has enough allowance.
     * @param sender The address to transfer tokens from.
     * @param recipient The address to transfer tokens to.
     * @param amount The amount of tokens to be transferred.
     * @return A boolean value indicating whether the operation succeeded.
     */
    function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
        _transfer(sender, recipient, amount);
        _approve(sender, _msgSender(), _allowances[sender][_msgSender()] - amount);
        return true;
    }

    /**
     * @dev Increases the allowance of a spender to a specified amount of tokens.
     * @param spender The address to allow to spend tokens.
     * @param addedValue The amount of tokens to be added to the allowance.
     * @return A boolean value indicating whether the operation succeeded.
     */
    function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender] + addedValue);
        return true;
    }

    /**
     * @dev Decreases the allowance of a spender to a specified amount of tokens.
     * @param spender The address to allow to spend tokens.
     * @param subtractedValue The amount of tokens to be subtracted from the allowance.
     * @return A boolean value indicating whether the operation succeeded.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender] - subtractedValue);
        return true;
    }

    /**
     * @dev Mints new tokens and adds them to the total supply.
     * @param amount The amount of tokens to be minted.
     */
    function mint(uint256 amount) public {
        _mint(_msgSender(), amount);
    }

    /**
     * @dev Burns a specified amount of tokens from the caller's balance.
     * @param amount The amount of tokens to be burned.
     */
    function burn(uint256 amount) public {
        _burn(_msgSender(), amount);
    }

    /**
     * @dev Internal function to transfer tokens from one address to another.
     * @param sender The address to transfer tokens from.
     * @param recipient The address to transfer tokens to.
     * @param amount The amount of tokens to be transferred.
     */
    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "CLAW: transfer from the zero address");
        require(recipient != address(0), "CLAW: transfer to the zero address");

        _balances[sender] -= amount;
        _balances[recipient] += amount;

        emit Transfer(sender, recipient, amount);
    }

    /**
     * @dev Internal function to approve the allowance of a spender.
     * @param owner The address that owns the tokens.
     * @param spender The address to allow to spend tokens.
     * @param amount The amount of tokens to be allowed.
     */
    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "CLAW: approve from the zero address");
        require(spender != address(0), "CLAW: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    /**
     * @dev Internal function to mint new tokens.
     * @param account The address to mint tokens to.
     * @param amount The amount of tokens to be minted.
     */
    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "CLAW: mint to the zero address");

        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
    }

    /**
     * @dev Internal function to burn tokens.
     * @param account The address to burn tokens from.
     * @param amount The amount of tokens to be burned.
     */
    function _burn(address account, uint256 amount) internal {
        require(account != address(0), "CLAW: burn from the zero address");

        _balances[account] -= amount;
        _totalSupply -= amount;
        emit Transfer(account, address(0), amount);
    }

    /**
     * @dev Returns the address of the caller.
     * @return The address of the caller.
     */
    function _msgSender() internal view returns (address) {
        return msg.sender;
    }

    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
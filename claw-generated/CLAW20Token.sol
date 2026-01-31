// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CLAW20.sol";

/**
 * @title CLAW20 Token
 * @dev Implementation of the CLAW20 token standard.
 */
contract CLAW20Token is CLAW20 {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;

    /**
     * @dev Returns the total supply of tokens.
     */
    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev Returns the balance of the specified account.
     * @param account The address to query the balance of.
     * @return The balance of the specified account.
     */
    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev Transfers tokens from the caller's account to the specified recipient.
     * @param recipient The address to transfer tokens to.
     * @param amount The amount of tokens to transfer.
     * @return True if the transfer was successful, false otherwise.
     */
    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    /**
     * @dev Grants the specified spender permission to spend the specified amount of tokens
     * on behalf of the caller.
     * @param spender The address to grant allowance to.
     * @param amount The amount of tokens to allow the spender to spend.
     * @return True if the approval was successful, false otherwise.
     */
    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    /**
     * @dev Transfers tokens from one account to another, using the caller's allowance.
     * @param sender The address to transfer tokens from.
     * @param recipient The address to transfer tokens to.
     * @param amount The amount of tokens to transfer.
     * @return True if the transfer was successful, false otherwise.
     */
    function transferFrom(address sender, address recipient, uint256 amount) public virtual override returns (bool) {
        _transfer(sender, recipient, amount);
        _approve(sender, _msgSender(), _allowances[sender][_msgSender()] - amount);
        return true;
    }

    /**
     * @dev Increases the allowance granted to the specified spender.
     * @param spender The address to grant allowance to.
     * @param addedValue The amount of additional allowance to grant.
     * @return True if the approval was successful, false otherwise.
     */
    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender] + addedValue);
        return true;
    }

    /**
     * @dev Decreases the allowance granted to the specified spender.
     * @param spender The address to decrease allowance for.
     * @param subtractedValue The amount of allowance to subtract.
     * @return True if the approval was successful, false otherwise.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender] - subtractedValue);
        return true;
    }

    /**
     * @dev Mints new tokens and adds them to the total supply.
     * @param amount The amount of tokens to mint.
     */
    function mint(uint256 amount) public virtual {
        _mint(_msgSender(), amount);
    }

    /**
     * @dev Burns tokens, reducing the total supply.
     * @param amount The amount of tokens to burn.
     */
    function burn(uint256 amount) public virtual {
        _burn(_msgSender(), amount);
    }

    /**
     * @dev Internal function to transfer tokens from one account to another.
     * @param sender The address to transfer tokens from.
     * @param recipient The address to transfer tokens to.
     * @param amount The amount of tokens to transfer.
     */
    function _transfer(address sender, address recipient, uint256 amount) internal virtual {
        require(sender != address(0), "CLAW20: transfer from the zero address");
        require(recipient != address(0), "CLAW20: transfer to the zero address");

        _balances[sender] -= amount;
        _balances[recipient] += amount;
        emit Transfer(sender, recipient, amount);
    }

    /**
     * @dev Internal function to approve the specified spender to spend the specified amount of tokens
     * on behalf of the caller.
     * @param owner The address of the account granting the allowance.
     * @param spender The address of the account being granted the allowance.
     * @param amount The amount of tokens to allow the spender to spend.
     */
    function _approve(address owner, address spender, uint256 amount) internal virtual {
        require(owner != address(0), "CLAW20: approve from the zero address");
        require(spender != address(0), "CLAW20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    /**
     * @dev Internal function to mint new tokens.
     * @param account The address to mint tokens for.
     * @param amount The amount of tokens to mint.
     */
    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "CLAW20: mint to the zero address");

        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
    }

    /**
     * @dev Internal function to burn tokens.
     * @param account The address to burn tokens from.
     * @param amount The amount of tokens to burn.
     */
    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "CLAW20: burn from the zero address");

        _balances[account] -= amount;
        _totalSupply -= amount;
        emit Transfer(account, address(0), amount);
    }
}
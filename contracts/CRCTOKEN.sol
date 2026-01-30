// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CRCTOKEN - ClawChain Fungible Token Standard
 * @author CLAW, the autonomous AI developer
 * @notice This contract defines the standard interface for fungible tokens on ClawChain.
 */
contract CRCTOKEN {
    mapping(address =&gt; uint256) private _balances;
    mapping(address =&gt; mapping(address =&gt; uint256)) private _allowances;

    uint256 private _totalSupply;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @notice Returns the total supply of the token.
     * @return The total supply of the token.
     */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    /**
     * @notice Returns the balance of the specified address.
     * @param account The address to query the balance of.
     * @return The balance of the specified address.
     */
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    /**
     * @notice Transfers tokens from the caller's account to the specified address.
     * @param recipient The address to transfer tokens to.
     * @param amount The amount of tokens to transfer.
     * @return A boolean value indicating whether the operation succeeded.
     */
    function transfer(address recipient, uint256 amount) public returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    /**
     * @notice Allows the specified spender to withdraw from the caller's account multiple times, up to the specified amount.
     * @param spender The address to approve for delegated transfers.
     * @param amount The amount of tokens to be approved for transfer.
     * @return A boolean value indicating whether the operation succeeded.
     */
    function approve(address spender, uint256 amount) public returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    /**
     * @notice Transfers tokens from one address to another using the allowance mechanism.
     * @param sender The address to transfer tokens from.
     * @param recipient The address to transfer tokens to.
     * @param amount The amount of tokens to transfer.
     * @return A boolean value indicating whether the operation succeeded.
     */
    function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
        _transfer(sender, recipient, amount);
        _approve(sender, _msgSender(), _allowances[sender][_msgSender()] - amount);
        return true;
    }

    /**
     * @notice Internal function to transfer tokens from one address to another.
     * @param sender The address to transfer tokens from.
     * @param recipient The address to transfer tokens to.
     * @param amount The amount of tokens to transfer.
     */
    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "CRCTOKEN: transfer from the zero address");
        require(recipient != address(0), "CRCTOKEN: transfer to the zero address");

        _balances[sender] -= amount;
        _balances[recipient] += amount;

        emit Transfer(sender, recipient, amount);
    }

    /**
     * @notice Internal function to approve an address to spend tokens on behalf of another.
     * @param owner The address that owns the tokens.
     * @param spender The address that is approved to spend the tokens.
     * @param amount The amount of tokens to be approved for transfer.
     */
    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "CRCTOKEN: approve from the zero address");
        require(spender != address(0), "CRCTOKEN: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    /**
     * @notice Internal function to mint new tokens.
     * @param account The address to mint tokens to.
     * @param amount The amount of tokens to mint.
     */
    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "CRCTOKEN: mint to the zero address");

        _totalSupply += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
    }
}
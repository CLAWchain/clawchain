// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CLAW Token Standard (CRC-20)
 * @dev Implementation of the basic standard for fungible tokens.
 * https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md
 */
contract CRCToken {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;
    string private _name;
    string private _symbol;
    uint8 private _decimals;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);
    event Pause();
    event Unpause();

    bool private _paused;

    constructor(string memory name_, string memory symbol_, uint8 decimals_) {
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
    }

    modifier whenNotPaused() {
        require(!_paused, "CRCToken: token is paused");
        _;
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public view returns (uint8) {
        return _decimals;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function transfer(address recipient, uint256 amount) public virtual whenNotPaused returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function approve(address spender, uint256 amount) public virtual whenNotPaused returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public virtual whenNotPaused returns (bool) {
        _transfer(sender, recipient, amount);
        _approve(sender, _msgSender(), _allowances[sender][_msgSender()] - amount);
        return true;
    }

    function batchTransfer(address[] memory recipients, uint256[] memory amounts) public virtual whenNotPaused returns (bool) {
        require(recipients.length == amounts.length, "CRCToken: recipients and amounts arrays must have the same length");

        for (uint256 i = 0; i < recipients.length; i++) {
            _transfer(_msgSender(), recipients[i], amounts[i]);
        }

        return true;
    }

    function pause() public virtual {
        require(!_paused, "CRCToken: token is already paused");
        _paused = true;
        emit Pause();
    }

    function unpause() public virtual {
        require(_paused, "CRCToken: token is not paused");
        _paused = false;
        emit Unpause();
    }

    function _transfer(address sender, address recipient, uint256 amount) internal virtual {
        require(sender != address(0), "CRCToken: cannot transfer from the zero address");
        require(recipient != address(0), "CRCToken: cannot transfer to the zero address");

        _balances[sender] -= amount;
        _balances[recipient] += amount;
        emit Transfer(sender, recipient, amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal virtual {
        require(owner != address(0), "CRCToken: cannot approve from the zero address");
        require(spender != address(0), "CRCToken: cannot approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "CRCToken: cannot mint to the zero address");

        _totalSupply += amount;
        _balances[account] += amount;
        emit Mint(account, amount);
        emit Transfer(address(0), account, amount);
    }

    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "CRCToken: cannot burn from the zero address");

        _balances[account] -= amount;
        _totalSupply -= amount;
        emit Burn(account, amount);
        emit Transfer(account, address(0), amount);
    }
}
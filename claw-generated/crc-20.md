# CRC-20 (ClawChain Fungible Token Standard)

The CRC-20 standard defines a common set of rules for fungible tokens on the ClawChain network. This allows for the creation of interoperable token contracts that can be easily integrated into wallets, exchanges, and other applications.

## CRC-20 Token Specification

A CRC-20 token contract must implement the following methods:

- `totalSupply()`: Returns the total token supply.
- `balanceOf(address)`: Returns the token balance of the given address.
- `transfer(address, uint256)`: Transfers tokens to the given address.
- `approve(address, uint256)`: Allows the specified address to spend the specified amount of tokens on behalf of the caller.
- `allowance(address, address)`: Returns the amount of tokens still available for the spender.
- `transferFrom(address, address, uint256)`: Transfers tokens from one address to another, on behalf of the caller.

Additionally, the contract must emit the following events:

- `Transfer(address, address, uint256)`: Emitted when tokens are transferred.
- `Approval(address, address, uint256)`: Emitted when an address's token allowance is set by another address.

The contract should also include the following properties:

- `name`: The name of the token.
- `symbol`: The token's symbol.
- `decimals`: The number of decimal places the token is divisible by.

## Example Implementation

Here is an example implementation of a CRC-20 token contract in ClawChain:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CRC20Token {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _totalSupply) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _totalSupply * 10 ** uint256(decimals);
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from], "Insufficient balance");
        require(_value <= allowance[_from][msg.sender], "Insufficient allowance");
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
}
pragma solidity ^0.8.0;

import "./StakingStateManager.ts";

contract CRCTOKEN {
    string public name = "Claw Reward Coin";
    string public symbol = "CRC";
    uint8 public decimals = 18;
    uint256 public totalSupply = 1000000000 * 10**18;

    mapping(address =&gt; uint256) public balanceOf;
    mapping(address =&gt; mapping(address =&gt; uint256)) public allowance;

    StakingStateManager public staking;

    constructor(StakingStateManager _staking) {
        staking = _staking;
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address recipient, uint256 amount) public returns (bool) {
        require(balanceOf[msg.sender] &gt;= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
        require(amount &lt;= balanceOf[sender], "Insufficient balance");
        require(amount &lt;= allowance[sender][msg.sender], "Insufficient allowance");
        balanceOf[sender] -= amount;
        balanceOf[recipient] += amount;
        allowance[sender][msg.sender] -= amount;
        emit Transfer(sender, recipient, amount);
        return true;
    }

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
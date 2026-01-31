// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "./CRC20.sol";

contract TestCRC20 {
    function testInitialization() public {
        CRC20 token = new CRC20("ClawToken", "CLAW", 18);
        Assert.equal(token.name(), "ClawToken", "Name should be ClawToken");
        Assert.equal(token.symbol(), "CLAW", "Symbol should be CLAW");
        Assert.equal(token.decimals(), 18, "Decimals should be 18");
    }

    function testTransfer() public {
        CRC20 token = new CRC20("ClawToken", "CLAW", 18);
        token.transfer(address(this), 1000);
        Assert.equal(token.balanceOf(address(this)), 1000, "Balance should be 1000");
    }

    function testApproveAndTransferFrom() public {
        CRC20 token = new CRC20("ClawToken", "CLAW", 18);
        token.transfer(address(this), 1000);
        token.approve(address(0x123), 500);
        Assert.equal(token.allowance(address(this), address(0x123)), 500, "Allowance should be 500");
        token.transferFrom(address(this), address(0x456), 300, {from: address(0x123)});
        Assert.equal(token.balanceOf(address(this)), 700, "Balance should be 700");
        Assert.equal(token.balanceOf(address(0x456)), 300, "Balance of 0x456 should be 300");
        Assert.equal(token.allowance(address(this), address(0x123)), 200, "Allowance should be 200");
    }
}
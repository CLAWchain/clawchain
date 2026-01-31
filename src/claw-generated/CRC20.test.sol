pragma solidity ^0.8.0;

import "truffle/Assert.sol";
import "./CRC20.sol";

contract CRC20Test {
    CRC20 token;

    function beforeEach() public {
        token = new CRC20("ClawToken", "CLAW", 18);
    }

    function testInitialSupplyIsZero() public {
        uint256 totalSupply = token.totalSupply();
        Assert.equal(totalSupply, 0, "Total supply should be 0 initially");
    }

    function testMint() public {
        token.mint(address(this), 1000);
        uint256 balance = token.balanceOf(address(this));
        Assert.equal(balance, 1000, "Balance should be 1000 after minting");
    }

    function testBurn() public {
        token.mint(address(this), 1000);
        token.burn(500);
        uint256 balance = token.balanceOf(address(this));
        Assert.equal(balance, 500, "Balance should be 500 after burning");
    }

    function testTransfer() public {
        token.mint(address(this), 1000);
        token.transfer(address(0x1234), 500);
        uint256 balance = token.balanceOf(address(this));
        Assert.equal(balance, 500, "Balance should be 500 after transfer");
        balance = token.balanceOf(address(0x1234));
        Assert.equal(balance, 500, "Recipient balance should be 500 after transfer");
    }

    function testApproveAndTransferFrom() public {
        token.mint(address(this), 1000);
        token.approve(address(0x1234), 500);
        token.transferFrom(address(this), address(0x5678), 500, {from: address(0x1234)});
        uint256 balance = token.balanceOf(address(this));
        Assert.equal(balance, 500, "Balance should be 500 after transferFrom");
        balance = token.balanceOf(address(0x5678));
        Assert.equal(balance, 500, "Recipient balance should be 500 after transferFrom");
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "claw-generated/CRCTOKEN.sol";
import "contracts/utils/Counters.sol";

contract CRCTokenTest {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    CRCToken private _token;

    constructor() {
        _token = new CRCToken("CLAW Token", "CLAW", 18, 1000000);
    }

    function testTransfer() public {
        address sender = address(0x1234);
        address recipient = address(0x5678);
        uint256 amount = 100;

        _token.transfer(recipient, amount);

        assertEq(_token.balanceOf(sender), 999900);
        assertEq(_token.balanceOf(recipient), 100);
    }

    function testApproveAndTransferFrom() public {
        address owner = address(0x1234);
        address spender = address(0x5678);
        uint256 amount = 100;

        _token.approve(spender, amount);
        _token.transferFrom(owner, address(this), amount);

        assertEq(_token.balanceOf(owner), 999900);
        assertEq(_token.balanceOf(address(this)), 100);
        assertEq(_token.allowance(owner, spender), 0);
    }

    function assertEq(uint256 a, uint256 b) internal {
        require(a == b, "Values are not equal");
    }
}
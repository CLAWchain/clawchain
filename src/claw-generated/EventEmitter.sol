// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EventEmitter {
    event Log(address indexed sender, string message);

    function emit(string memory message) public {
        emit Log(msg.sender, message);
    }
}
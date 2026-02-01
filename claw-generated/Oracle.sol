// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Oracle {
    using Counters for Counters.Counter;
    using ECDSA for bytes32;

    Counters.Counter private _requestId;

    struct OracleRequest {
        bytes32 commitment;
        address requester;
        uint256 timestamp;
    }

    mapping(bytes32 => OracleRequest) public requests;

    event OracleRequestCreated(bytes32 indexed requestId, address indexed requester, uint256 timestamp);
    event OracleResponseRevealed(bytes32 indexed requestId, bytes data, address indexed oracle);

    function requestData(bytes32 commitment) public {
        _requestId.increment();
        bytes32 requestId = bytes32(_requestId.current());
        requests[requestId] = OracleRequest(commitment, msg.sender, block.timestamp);
        emit OracleRequestCreated(requestId, msg.sender, block.timestamp);
    }

    function fulfillData(bytes32 requestId, bytes memory data, bytes memory signature) public {
        OracleRequest storage request = requests[requestId];
        require(request.requester != address(0), "Request does not exist");
        require(block.timestamp - request.timestamp <= 1 hours, "Request has expired");

        bytes32 digest = keccak256(abi.encodePacked(requestId, data));
        require(digest.toEthSignedMessageHash().recover(signature) == request.requester, "Invalid signature");
        require(keccak256(abi.encodePacked(data)) == request.commitment, "Data does not match commitment");

        delete requests[requestId];
        emit OracleResponseRevealed(requestId, data, msg.sender);
    }
}
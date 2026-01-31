// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Oracle {
    // Data structures for oracle submissions
    struct OracleSubmission {
        bytes32 commitment;
        uint256 revealBlock;
    }

    mapping(address => mapping(bytes32 => OracleSubmission)) public submissions;

    // Events
    event OracleCommitted(address indexed sender, bytes32 indexed dataHash, uint256 revealBlock);
    event OracleRevealed(address indexed sender, bytes32 indexed dataHash, bytes data);

    // Functions
    function commitData(bytes32 dataHash, uint256 revealBlock) public {
        // Check if there's an existing submission
        OracleSubmission storage submission = submissions[msg.sender][dataHash];
        require(submission.commitment == 0, "Data already committed");

        // Store the commitment and reveal block
        submission.commitment = dataHash;
        submission.revealBlock = revealBlock;

        emit OracleCommitted(msg.sender, dataHash, revealBlock);
    }

    function revealData(bytes memory data) public {
        bytes32 dataHash = keccak256(data);

        // Check if there's a valid commitment
        OracleSubmission storage submission = submissions[msg.sender][dataHash];
        require(submission.commitment != 0, "No valid commitment");
        require(block.number >= submission.revealBlock, "Data not ready to be revealed");

        // Clear the submission and emit the reveal event
        delete submissions[msg.sender][dataHash];
        emit OracleRevealed(msg.sender, dataHash, data);
    }

    function getOracleData(bytes32 dataHash) public view returns (bytes memory) {
        // Retrieve the verified oracle data
        OracleSubmission storage submission = submissions[msg.sender][dataHash];
        require(submission.commitment != 0, "No valid data");
        return data;
    }
}
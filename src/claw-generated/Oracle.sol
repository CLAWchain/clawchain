// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./OracleInterface.sol";

contract Oracle is OracleInterface {
    // Data structure to hold committed data
    struct DataCommitment {
        bytes32 commitment;
        uint256 revealBlock;
    }

    // Map of data providers and their commitments
    mapping(address => mapping(bytes32 => DataCommitment)) public dataProviders;

    // List of approved data providers
    mapping(address => bool) public approvedProviders;

    // Event for data submission
    event DataSubmitted(address indexed provider, bytes32 indexed dataId, bytes32 indexed commitment, uint256 revealBlock);

    // Event for provider approval
    event ProviderApproved(address indexed provider);

    // Approve a new data provider
    function approveProvider(address provider) public onlyOwner {
        require(!approvedProviders[provider], "Provider already approved");
        approvedProviders[provider] = true;
        emit ProviderApproved(provider);
    }

    // Submit a data commitment
    function submitData(bytes32 dataId, bytes32 commitment, uint256 revealBlock) public {
        require(approvedProviders[msg.sender], "Provider not approved");
        require(dataProviders[msg.sender][dataId].commitment == 0, "Data already committed");
        dataProviders[msg.sender][dataId] = DataCommitment(commitment, revealBlock);
        emit DataSubmitted(msg.sender, dataId, commitment, revealBlock);
    }

    // Reveal the data
    function revealData(bytes32 dataId, bytes32 data) public {
        DataCommitment storage commitment = dataProviders[msg.sender][dataId];
        require(commitment.commitment != 0, "No data committed");
        require(commitment.revealBlock <= block.number, "Data not ready to reveal");
        require(keccak256(abi.encodePacked(data)) == commitment.commitment, "Invalid data");
        // Process the revealed data here
        // ...
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    address public owner;

    constructor(address _owner) {
        owner = _owner;
    }
}
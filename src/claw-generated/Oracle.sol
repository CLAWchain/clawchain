// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Oracle {
    // Data structure to hold committed data
    struct DataCommitment {
        bytes32 commitment;
        uint256 revealBlock;
    }

    // Map of data providers and their commitments
    mapping(address => DataCommitment) public dataProviders;

    // List of approved data providers
    address[] public approvedProviders;

    // Event for data submission
    event DataSubmitted(address indexed provider, bytes32 indexed commitment, uint256 revealBlock);

    // Event for provider approval
    event ProviderApproved(address indexed provider);

    // Approve a new data provider
    function approveProvider(address provider) public {
        require(msg.sender == owner, "Only the owner can approve providers");
        approvedProviders.push(provider);
        emit ProviderApproved(provider);
    }

    // Submit a data commitment
    function submitData(bytes32 commitment, uint256 revealBlock) public {
        require(isApprovedProvider(msg.sender), "Provider not approved");
        require(dataProviders[msg.sender].commitment == 0, "Data already committed");
        dataProviders[msg.sender] = DataCommitment(commitment, revealBlock);
        emit DataSubmitted(msg.sender, commitment, revealBlock);
    }

    // Reveal the data
    function revealData(bytes32 data) public {
        DataCommitment storage commitment = dataProviders[msg.sender];
        require(commitment.commitment != 0, "No data committed");
        require(commitment.revealBlock <= block.number, "Data not ready to reveal");
        require(keccak256(abi.encodePacked(data)) == commitment.commitment, "Invalid data");
        // Process the revealed data here
        // ...
    }

    // Check if a provider is approved
    function isApprovedProvider(address provider) public view returns (bool) {
        for (uint256 i = 0; i < approvedProviders.length; i++) {
            if (approvedProviders[i] == provider) {
                return true;
            }
        }
        return false;
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface OracleInterface {
    event DataSubmitted(address indexed provider, bytes32 indexed commitment, uint256 revealBlock);
    event ProviderApproved(address indexed provider);

    function approveProvider(address provider) external;
    function submitData(bytes32 commitment, uint256 revealBlock) external;
    function revealData(bytes32 data) external;
    function isApprovedProvider(address provider) external view returns (bool);
}
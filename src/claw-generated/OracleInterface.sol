// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface OracleInterface {
    function approveProvider(address provider) external;
    function submitData(bytes32 dataId, bytes32 commitment, uint256 revealBlock) external;
    function revealData(bytes32 dataId, bytes32 data) external;
}
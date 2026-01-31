// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./events.sol";

/**
 * @title ClawChain Transaction Receipt
 * @dev Handles the processing and storage of transaction receipts, including events.
 */
contract TransactionReceipt is EventEmitter {
    struct Receipt {
        address contractAddress;
        uint256 status;
        uint256 gasUsed;
        bytes32[] eventTopics;
        bytes eventData;
    }

    mapping(bytes32 => Receipt) public receipts;

    /**
     * @dev Processes a transaction and stores the receipt.
     * @param _contractAddress The address of the contract that executed the transaction.
     * @param _status The status of the transaction (success or failure).
     * @param _gasUsed The amount of gas used by the transaction.
     * @param _eventTopics The topics of the events emitted by the transaction.
     * @param _eventData The data of the events emitted by the transaction.
     */
    function processTransaction(
        address _contractAddress,
        uint256 _status,
        uint256 _gasUsed,
        bytes32[] memory _eventTopics,
        bytes memory _eventData
    ) internal {
        bytes32 transactionHash = keccak256(abi.encodePacked(_contractAddress, _status, _gasUsed, _eventTopics, _eventData));
        receipts[transactionHash] = Receipt({
            contractAddress: _contractAddress,
            status: _status,
            gasUsed: _gasUsed,
            eventTopics: _eventTopics,
            eventData: _eventData
        });

        // Emit events based on the transaction data
        if (_status == 1) {
            emitContractDeployed(_contractAddress, "MyContract");
        }
        emitValueUpdated(_contractAddress, "gasUsed", _gasUsed);
    }
}
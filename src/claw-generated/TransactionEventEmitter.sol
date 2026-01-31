pragma solidity ^0.8.0;

import "./Event.sol";
import "./VerifierContract.sol";

/**
 * @title TransactionEventEmitter
 * @dev Extends the TransactionProcessor to handle event emission and storage in transaction receipts.
 */
contract TransactionEventEmitter is TransactionProcessor {
    Event public eventContract;

    constructor(VerifierContract _verifierContract, Event _eventContract) TransactionProcessor(_verifierContract) {
        eventContract = _eventContract;
    }

    function processTransaction(
        bytes memory proof,
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[1] memory input
    ) public {
        require(verifierContract.verifyProof(proof, a, b, c, input), "Invalid zk-SNARK proof");

        // Emit an event for the transaction
        eventContract.emitEvent(address(this), "TransactionProcessed", abi.encode(proof, a, b, c, input));

        // Process transaction logic
    }
}
pragma solidity ^0.8.0;

/**
 * @title Event
 * @dev Defines the structure and functionality for events in ClawChain smart contracts.
 */
contract Event {
    // Event definition
    event ContractEvent(address indexed contractAddress, string indexed eventName, bytes indexed eventData);

    /**
     * @dev Emits an event with the provided parameters.
     * @param contractAddress The address of the contract that emitted the event.
     * @param eventName The name of the event.
     * @param eventData The data associated with the event.
     */
    function emitEvent(address contractAddress, string memory eventName, bytes memory eventData) public {
        emit ContractEvent(contractAddress, eventName, eventData);
    }
}
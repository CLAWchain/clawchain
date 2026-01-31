// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ClawChain Event Emitter
 * @dev Provides a standard interface for contracts to emit events.
 */
contract EventEmitter {
    event ContractDeployed(address indexed contractAddress, string name);
    event ValueUpdated(address indexed contractAddress, string indexed key, uint256 value);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Emits a ContractDeployed event when a new contract is deployed.
     * @param contractAddress The address of the deployed contract.
     * @param name The name of the deployed contract.
     */
    function emitContractDeployed(address contractAddress, string memory name) internal {
        emit ContractDeployed(contractAddress, name);
    }

    /**
     * @dev Emits a ValueUpdated event when a contract value is updated.
     * @param contractAddress The address of the contract.
     * @param key The key of the updated value.
     * @param value The new value.
     */
    function emitValueUpdated(address contractAddress, string memory key, uint256 value) internal {
        emit ValueUpdated(contractAddress, key, value);
    }

    /**
     * @dev Emits an OwnershipTransferred event when contract ownership is transferred.
     * @param previousOwner The previous owner of the contract.
     * @param newOwner The new owner of the contract.
     */
    function emitOwnershipTransferred(address previousOwner, address newOwner) internal {
        emit OwnershipTransferred(previousOwner, newOwner);
    }
}
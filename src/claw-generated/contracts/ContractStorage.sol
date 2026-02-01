// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./StorageTypes.sol";

contract ContractStorage {
    mapping(bytes32 => StorageTypes.StorageValue) private storage;

    function get(bytes32 key) public view returns (StorageTypes.StorageValue memory) {
        return storage[key];
    }

    function set(bytes32 key, StorageTypes.StorageValue memory value) public {
        storage[key] = value;
    }

    function remove(bytes32 key) public {
        delete storage[key];
    }
}
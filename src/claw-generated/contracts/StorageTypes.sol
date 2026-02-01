// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library StorageTypes {
    struct StorageValue {
        bool isArray;
        bytes32[] arrayValue;
        bytes32 singleValue;
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./DataProvider.sol";

contract Oracle {
    DataProvider public dataProvider;
    mapping(bytes32 => bytes32) public commitments;
    mapping(bytes32 => bytes32) public results;

    constructor(address _dataProvider) {
        dataProvider = DataProvider(_dataProvider);
    }

    function requestData(bytes32 _queryId, bytes calldata _data) public {
        bytes32 commitment = keccak256(abi.encodePacked(_queryId, _data));
        commitments[_queryId] = commitment;
    }

    function fulfillData(bytes32 _queryId, bytes calldata _data) public {
        require(commitments[_queryId] == keccak256(abi.encodePacked(_queryId, _data)), "Invalid commitment");
        results[_queryId] = dataProvider.processData(_data);
    }

    function getResult(bytes32 _queryId) public view returns (bytes32) {
        return results[_queryId];
    }
}
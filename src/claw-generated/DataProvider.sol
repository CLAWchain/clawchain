// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ExternalDataSource.sol";

contract DataProvider {
    ExternalDataSource public dataSource;

    constructor(address _dataSource) {
        dataSource = ExternalDataSource(_dataSource);
    }

    function processData(bytes calldata _data) public returns (bytes32) {
        // Fetch data from external source
        bytes memory result = dataSource.fetchData(_data);

        // Perform any necessary processing
        bytes32 processedData = keccak256(result);

        return processedData;
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

contract ExternalDataSource is ChainlinkClient {
    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    constructor(address _oracle, bytes32 _jobId, uint256 _fee) {
        setChainlinkOracle(_oracle);
        jobId = _jobId;
        fee = _fee;
    }

    function fetchData(bytes calldata _data) public returns (bytes memory) {
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfillData.selector);
        request.add("data", string(abi.encodePacked(_data)));
        return sendChainlinkRequestTo(oracle, request, fee);
    }

    function fulfillData(bytes32 _requestId, bytes memory _result) public recordChainlinkFulfillment(_requestId) {
        // Store the result for later use
    }
}
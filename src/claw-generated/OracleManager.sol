// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";

contract OracleManager {
    using Counters for Counters.Counter;
    Counters.Counter private _dataIdCounter;

    struct OracleData {
        bytes32 dataHash;
        bytes data;
        bytes32 nonce;
        uint256 timestamp;
    }

    mapping(bytes32 => OracleData) public oracleData;

    event DataCommitted(bytes32 indexed dataId, bytes32 dataHash);
    event DataRevealed(bytes32 indexed dataId, bytes data);

    function commitData(bytes32 dataHash) public {
        bytes32 dataId = _getNextDataId();
        oracleData[dataId] = OracleData({
            dataHash: dataHash,
            data: bytes(""),
            nonce: bytes32(0),
            timestamp: block.timestamp
        });
        emit DataCommitted(dataId, dataHash);
    }

    function revealData(bytes memory data, bytes32 nonce) public {
        bytes32 dataId = _getNextDataId();
        require(oracleData[dataId].dataHash == keccak256(abi.encodePacked(data, nonce)), "Data does not match commit");
        oracleData[dataId].data = data;
        oracleData[dataId].nonce = nonce;
        emit DataRevealed(dataId, data);
    }

    function getLatestData(bytes32 dataId) public view returns (bytes memory) {
        return oracleData[dataId].data;
    }

    function _getNextDataId() private returns (bytes32) {
        _dataIdCounter.increment();
        return keccak256(abi.encodePacked(block.timestamp, _dataIdCounter.current()));
    }
}
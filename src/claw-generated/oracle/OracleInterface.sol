pragma solidity ^0.8.0;

interface OracleInterface {
    event RequestData(bytes32 indexed requestId, address indexed clientAddress, string dataType, uint256 reward);
    event DataCommitted(bytes32 indexed requestId, bytes32 dataHash, uint256 deposit);
    event DataRevealed(bytes32 indexed requestId, string data);

    function requestData(bytes32 requestId, address clientAddress, string memory dataType, uint256 reward) external;
    function commitData(bytes32 requestId, bytes32 dataHash, uint256 deposit) external;
    function revealData(bytes32 requestId, string memory data) external;
    function retrieveData(bytes32 requestId) external view returns (string memory);
}
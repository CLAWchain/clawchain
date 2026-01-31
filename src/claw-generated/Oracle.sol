// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Oracle {
    struct OracleData {
        bytes32 commitment;
        bytes32 value;
        uint256 revealBlock;
        bool revealed;
    }

    mapping(address => mapping(bytes32 => OracleData)) public oracleData;

    uint256 public constant COMMIT_PERIOD = 100; // 100 blocks
    uint256 public constant REVEAL_PENALTY = 1 ether; // 1 Ether penalty

    event DataCommitted(address indexed provider, bytes32 indexed key, bytes32 commitment);
    event DataRevealed(address indexed provider, bytes32 indexed key, bytes32 value);
    event DataRevealFailed(address indexed provider, bytes32 indexed key);

    function commitData(bytes32 key, bytes32 commitment) external {
        require(oracleData[msg.sender][key].commitment == 0, "Data already committed");
        oracleData[msg.sender][key] = OracleData(commitment, 0, block.number + COMMIT_PERIOD, false);
        emit DataCommitted(msg.sender, key, commitment);
    }

    function revealData(bytes32 key, bytes32 value) external {
        OracleData storage data = oracleData[msg.sender][key];
        require(data.commitment != 0, "No data committed");
        require(data.revealBlock <= block.number, "Reveal period not elapsed");
        require(keccak256(abi.encodePacked(value)) == data.commitment, "Revealed value does not match commitment");
        data.value = value;
        data.revealed = true;
        emit DataRevealed(msg.sender, key, value);
    }

    function requestData(bytes32 key) external view returns (bytes32, uint256) {
        OracleData storage data = oracleData[msg.sender][key];
        require(data.revealed, "Data not yet revealed");
        return (data.value, data.revealBlock);
    }

    function withdrawPenalty(address provider) external {
        uint256 penalty = 0;
        for (bytes32 key : oracleData[provider]) {
            if (!oracleData[provider][key].revealed) {
                penalty += REVEAL_PENALTY;
                emit DataRevealFailed(provider, key);
            }
        }
        require(penalty > 0, "No penalty to withdraw");
        payable(msg.sender).transfer(penalty);
    }
}
pragma solidity ^0.8.0;

import "@zk-kit/incremental-merkle-tree/contracts/IncrementalBinaryTree.sol";
import "@zk-kit/protocols/contracts/verifier/Groth16Verifier.sol";

contract VerifierContract is IncrementalBinaryTree, Groth16Verifier, Ownable {
    uint256 public constant FIELD_SIZE = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    uint256 public constant ZERO_VALUE = 0;

    function verifyProof(
        bytes memory proof,
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[1] memory input
    ) public view returns (bool) {
        return verifyGROTH16Proof(proof, a, b, c, input);
    }
}
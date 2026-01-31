// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CLAW20.sol";

contract Governance {
    CLAW20 public token;
    mapping(uint256 => Proposal) public proposals;
    mapping(address => mapping(uint256 => bool)) public votes;
    uint256 public proposalCount;

    struct Proposal {
        uint256 id;
        string description;
        uint256 startBlock;
        uint256 endBlock;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
    }

    constructor(CLAW20 _token) {
        token = _token;
    }

    function createProposal(string memory description, uint256 votingPeriod) public {
        require(token.balanceOf(msg.sender) >= 1000 * 10 ** 18, "Minimum 1000 CLAW tokens required to create a proposal");
        uint256 startBlock = block.number;
        uint256 endBlock = startBlock + votingPeriod;
        proposals[proposalCount] = Proposal(proposalCount, description, startBlock, endBlock, 0, 0, false);
        proposalCount++;
    }

    function vote(uint256 proposalId, bool support) public {
        require(block.number >= proposals[proposalId].startBlock && block.number <= proposals[proposalId].endBlock, "Voting period has ended");
        require(!votes[msg.sender][proposalId], "You have already voted on this proposal");
        require(token.balanceOf(msg.sender) > 0, "You must hold CLAW tokens to vote");
        votes[msg.sender][proposalId] = true;
        if (support) {
            proposals[proposalId].forVotes += token.balanceOf(msg.sender);
        } else {
            proposals[proposalId].againstVotes += token.balanceOf(msg.sender);
        }
    }

    function executeProposal(uint256 proposalId) public {
        require(block.number > proposals[proposalId].endBlock, "Voting period has not ended");
        require(!proposals[proposalId].executed, "Proposal has already been executed");
        require(proposals[proposalId].forVotes > proposals[proposalId].againstVotes, "Proposal did not pass");
        // Execute the proposal's logic here
        proposals[proposalId].executed = true;
    }
}
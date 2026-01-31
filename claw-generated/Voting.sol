// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Voting {
    IERC20 public token;
    mapping(address => uint256) public votes;
    mapping(uint256 => Vote) public proposals;
    uint256 public proposalCount;

    struct Vote {
        address proposer;
        string description;
        uint256 startBlock;
        uint256 endBlock;
        uint256 quorum;
        mapping(address => bool) voted;
        mapping(address => bool) votedFor;
    }

    constructor(address _token) {
        token = IERC20(_token);
    }

    function propose(string memory _description, uint256 _quorum, uint256 _duration) public {
        require(_quorum > 0 && _quorum <= 100, "Invalid quorum");
        require(_duration > 0, "Invalid duration");
        uint256 startBlock = block.number;
        uint256 endBlock = startBlock + _duration;
        proposals[proposalCount] = Vote(msg.sender, _description, startBlock, endBlock, _quorum);
        proposalCount++;
    }

    function vote(uint256 _proposalId, bool _support) public {
        Vote storage proposal = proposals[_proposalId];
        require(block.number >= proposal.startBlock && block.number <= proposal.endBlock, "Voting period closed");
        require(!proposal.voted[msg.sender], "Already voted");
        uint256 balance = token.balanceOf(msg.sender);
        require(balance > 0, "No voting power");
        proposal.voted[msg.sender] = true;
        proposal.votedFor[msg.sender] = _support;
        votes[msg.sender] += balance * (_support ? 1 : -1);
    }

    function getVoteCount(uint256 _proposalId) public view returns (uint256, uint256) {
        Vote storage proposal = proposals[_proposalId];
        uint256 forCount = 0;
        uint256 againstCount = 0;
        for (address voter in proposal.votedFor) {
            if (proposal.votedFor[voter]) {
                forCount += token.balanceOf(voter);
            } else {
                againstCount += token.balanceOf(voter);
            }
        }
        return (forCount, againstCount);
    }

    function finalizeProposal(uint256 _proposalId) public {
        Vote storage proposal = proposals[_proposalId];
        require(block.number > proposal.endBlock, "Voting period not over");
        (uint256 forCount, uint256 againstCount) = getVoteCount(_proposalId);
        require(forCount >= proposal.quorum * (forCount + againstCount) / 100, "Quorum not met");
        // Implement proposal execution logic here
    }
}
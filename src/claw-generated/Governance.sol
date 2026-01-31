// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Governance {
    IERC20 public token;
    mapping(address =&gt; uint256) public votes;
    mapping(uint256 =&gt; Proposal) public proposals;
    uint256 public proposalCount;

    struct Proposal {
        string description;
        uint256 startBlock;
        uint256 endBlock;
        uint256 yesVotes;
        uint256 noVotes;
        bool executed;
    }

    constructor(IERC20 _token) {
        token = _token;
    }

    function propose(string memory _description, uint256 _duration) public {
        require(_duration &gt; 0, "Duration must be greater than 0");
        uint256 proposalId = proposalCount++;
        proposals[proposalId] = Proposal({
            description: _description,
            startBlock: block.number,
            endBlock: block.number + _duration,
            yesVotes: 0,
            noVotes: 0,
            executed: false
        });
    }

    function vote(uint256 _proposalId, bool _support) public {
        Proposal storage proposal = proposals[_proposalId];
        require(block.number &gt;= proposal.startBlock &amp;&amp; block.number &lt;= proposal.endBlock, "Voting period has ended");
        require(votes[msg.sender] + token.balanceOf(msg.sender) &gt;= token.balanceOf(msg.sender), "Insufficient tokens to vote");
        if (_support) {
            proposal.yesVotes += token.balanceOf(msg.sender);
        } else {
            proposal.noVotes += token.balanceOf(msg.sender);
        }
        votes[msg.sender] += token.balanceOf(msg.sender);
    }

    function execute(uint256 _proposalId) public {
        Proposal storage proposal = proposals[_proposalId];
        require(block.number &gt; proposal.endBlock, "Voting period has not ended");
        require(!proposal.executed, "Proposal has already been executed");
        require(proposal.yesVotes &gt; proposal.noVotes, "Proposal did not pass");
        proposal.executed = true;
        // Execute the proposal's actions here
    }
}
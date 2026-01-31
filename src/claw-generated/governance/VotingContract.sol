pragma solidity ^0.8.0;

import "../token/ClawToken.sol";

contract VotingContract {
    ClawToken public token;
    
    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 startBlock;
        uint256 endBlock;
        mapping(address =&gt; bool) votes;
        uint256 totalVotes;
        uint256 quorum;
        uint256 passThreshold;
    }
    
    mapping(uint256 =&gt; Proposal) public proposals;
    uint256 public proposalCount;
    
    mapping(address =&gt; address) public delegates;
    
    constructor(ClawToken _token) {
        token = _token;
    }
    
    function createProposal(string memory title, string memory description, uint256 duration, uint256 _quorum, uint256 _passThreshold) public {
        uint256 startBlock = block.number;
        uint256 endBlock = startBlock + duration;
        
        Proposal storage proposal = proposals[proposalCount];
        proposal.id = proposalCount;
        proposal.title = title;
        proposal.description = description;
        proposal.startBlock = startBlock;
        proposal.endBlock = endBlock;
        proposal.quorum = _quorum;
        proposal.passThreshold = _passThreshold;
        proposalCount++;
    }
    
    function delegate(address to) public {
        delegates[msg.sender] = to;
    }
    
    function vote(uint256 proposalId, bool support) public {
        Proposal storage proposal = proposals[proposalId];
        require(block.number &gt;= proposal.startBlock &amp;&amp; block.number &lt;= proposal.endBlock, "Voting is not open");
        require(!proposal.votes[msg.sender], "You have already voted");
        
        address voter = delegates[msg.sender] == address(0) ? msg.sender : delegates[msg.sender];
        uint256 balance = token.balanceOf(voter);
        proposal.votes[voter] = true;
        proposal.totalVotes += balance;
    }
    
    function getProposal(uint256 proposalId) public view returns (Proposal memory) {
        return proposals[proposalId];
    }
    
    function proposalPassed(uint256 proposalId) public view returns (bool) {
        Proposal storage proposal = proposals[proposalId];
        return proposal.totalVotes &gt;= proposal.quorum &amp;&amp; proposal.totalVotes * 100 / token.totalSupply() &gt;= proposal.passThreshold;
    }
}
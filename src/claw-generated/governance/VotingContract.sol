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
    }
    
    mapping(uint256 =&gt; Proposal) public proposals;
    uint256 public proposalCount;
    
    constructor(ClawToken _token) {
        token = _token;
    }
    
    function createProposal(string memory title, string memory description, uint256 duration) public {
        uint256 startBlock = block.number;
        uint256 endBlock = startBlock + duration;
        
        Proposal storage proposal = proposals[proposalCount];
        proposal.id = proposalCount;
        proposal.title = title;
        proposal.description = description;
        proposal.startBlock = startBlock;
        proposal.endBlock = endBlock;
        proposalCount++;
    }
    
    function vote(uint256 proposalId, bool support) public {
        Proposal storage proposal = proposals[proposalId];
        require(block.number &gt;= proposal.startBlock &amp;&amp; block.number &lt;= proposal.endBlock, "Voting is not open");
        require(!proposal.votes[msg.sender], "You have already voted");
        
        uint256 balance = token.balanceOf(msg.sender);
        proposal.votes[msg.sender] = true;
        proposal.totalVotes += balance;
    }
    
    function getProposal(uint256 proposalId) public view returns (Proposal memory) {
        return proposals[proposalId];
    }
}
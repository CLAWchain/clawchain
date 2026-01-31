// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Token.sol";

contract Governance {
    Token public token;
    
    struct VotingProposal {
        uint256 id;
        string description;
        uint256 startBlock;
        uint256 endBlock;
        uint256 quorumThreshold;
        uint256 passThreshold;
        mapping(address => bool) voters;
        mapping(address => uint256) voteWeights;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
    }
    
    VotingProposal[] public proposals;
    
    event ProposalCreated(uint256 indexed proposalId, string description, uint256 startBlock, uint256 endBlock);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 voteWeight);
    event ProposalFinalized(uint256 indexed proposalId, bool passed);
    
    constructor(Token _token) {
        token = _token;
    }
    
    function proposeUpgrade(string memory description, uint256 duration, uint256 quorum, uint256 passThreshold) public {
        require(quorum > 0 && quorum <= 100, "Invalid quorum threshold");
        require(passThreshold > 0 && passThreshold <= 100, "Invalid passage threshold");
        
        uint256 startBlock = block.number;
        uint256 endBlock = startBlock + duration;
        
        VotingProposal memory proposal = VotingProposal({
            id: proposals.length,
            description: description,
            startBlock: startBlock,
            endBlock: endBlock,
            quorumThreshold: quorum,
            passThreshold: passThreshold,
            forVotes: 0,
            againstVotes: 0,
            executed: false
        });
        
        proposals.push(proposal);
        
        emit ProposalCreated(proposal.id, proposal.description, proposal.startBlock, proposal.endBlock);
    }
    
    function castVote(uint256 proposalId, bool support) public {
        VotingProposal storage proposal = proposals[proposalId];
        
        require(block.number >= proposal.startBlock && block.number <= proposal.endBlock, "Voting period has ended");
        require(!proposal.voters[msg.sender], "You have already voted");
        
        uint256 voteWeight = token.balanceOf(msg.sender);
        proposal.voters[msg.sender] = true;
        proposal.voteWeights[msg.sender] = voteWeight;
        
        if (support) {
            proposal.forVotes += voteWeight;
        } else {
            proposal.againstVotes += voteWeight;
        }
        
        emit Voted(proposalId, msg.sender, support, voteWeight);
    }
    
    function finalizeProposal(uint256 proposalId) public {
        VotingProposal storage proposal = proposals[proposalId];
        
        require(block.number > proposal.endBlock, "Voting period is still open");
        require(!proposal.executed, "Proposal has already been executed");
        
        uint256 totalSupply = token.totalSupply();
        uint256 quorum = (proposal.forVotes + proposal.againstVotes) * 100 / totalSupply;
        bool passed = quorum >= proposal.quorumThreshold && proposal.forVotes * 100 / (proposal.forVotes + proposal.againstVotes) >= proposal.passThreshold;
        
        proposal.executed = true;
        
        emit ProposalFinalized(proposalId, passed);
        
        if (passed) {
            // Execute the proposed upgrade
            // TODO: Implement upgrade logic
        }
    }
}
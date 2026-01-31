pragma solidity ^0.8.0;

import "./CRCTOKEN.sol";
import "./StakingStateManager.ts";
import "./ProtocolUpgrader.sol";

contract Governance {
    CRCTOKEN public token;
    StakingStateManager public staking;
    ProtocolUpgrader public upgrader;

    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 startBlock;
        uint256 endBlock;
        uint256 quorum;
        mapping(address =&gt; bool) voted;
        mapping(address =&gt; uint256) voteWeight;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
    }

    mapping(uint256 =&gt; Proposal) public proposals;
    uint256 public nextProposalId = 1;

    constructor(CRCTOKEN _token, StakingStateManager _staking, ProtocolUpgrader _upgrader) {
        token = _token;
        staking = _staking;
        upgrader = _upgrader;
    }

    function proposeChange(string memory title, string memory description, uint256 duration, uint256 quorum) public {
        require(token.balanceOf(msg.sender) &gt;= 10000 * 10**18, "Minimum 10,000 CRC tokens required to propose");
        uint256 proposalId = nextProposalId++;
        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.title = title;
        proposal.description = description;
        proposal.startBlock = block.number;
        proposal.endBlock = block.number + duration;
        proposal.quorum = quorum;
        emit ProposalCreated(proposalId, msg.sender, title, description, proposal.startBlock, proposal.endBlock, quorum);
    }

    function castVote(uint256 proposalId, bool support) public {
        Proposal storage proposal = proposals[proposalId];
        require(block.number &gt;= proposal.startBlock && block.number &lt;= proposal.endBlock, "Voting period has ended");
        require(!proposal.voted[msg.sender], "You have already voted on this proposal");
        uint256 voteWeight = staking.getStakedBalance(msg.sender);
        proposal.voted[msg.sender] = true;
        proposal.voteWeight[msg.sender] = voteWeight;
        if (support) {
            proposal.forVotes += voteWeight;
        } else {
            proposal.againstVotes += voteWeight;
        }
        emit VoteCast(proposalId, msg.sender, support, voteWeight);
    }

    function executeProposal(uint256 proposalId) public {
        Proposal storage proposal = proposals[proposalId];
        require(block.number &gt; proposal.endBlock, "Voting period has not ended");
        require(proposal.forVotes &gt;= proposal.quorum, "Quorum not met");
        require(!proposal.executed, "Proposal has already been executed");
        proposal.executed = true;
        upgrader.applyProtocolUpgrade(proposal.title, proposal.description);
        emit ProposalExecuted(proposalId);
    }

    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title, string description, uint256 startBlock, uint256 endBlock, uint256 quorum);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 voteWeight);
    event ProposalExecuted(uint256 indexed proposalId);
}
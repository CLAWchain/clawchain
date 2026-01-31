// voting.ts

import { BigNumber } from 'ethers';
import { Block, Transaction } from '../types';
import { getTokenBalance } from '../token';

interface Proposal {
  id: string;
  title: string;
  description: string;
  author: string;
  voteStart: number;
  voteEnd: number;
  quorum: BigNumber;
  threshold: BigNumber;
}

interface Vote {
  voter: string;
  proposalId: string;
  support: boolean;
  amount: BigNumber;
}

enum ProposalState {
  Active,
  Passed,
  Failed
}

interface VoteTally {
  yesVotes: BigNumber;
  noVotes: BigNumber;
}

class VotingModule {
  private proposals: Proposal[] = [];
  private votes: Vote[] = [];

  async submitProposal(proposal: Proposal): Promise<string> {
    // Validate proposal parameters
    if (!proposal.title || !proposal.description || !proposal.author || proposal.voteStart >= proposal.voteEnd || proposal.quorum.lte(0) || proposal.threshold.lte(0)) {
      throw new Error('Invalid proposal parameters');
    }

    // Generate a unique proposal ID
    const proposalId = this.generateProposalId();

    // Add proposal to the list
    this.proposals.push({
      ...proposal,
      id: proposalId
    });

    // Return the proposal ID
    return proposalId;
  }

  async castVote(vote: Vote): Promise<void> {
    // Validate vote parameters
    if (!vote.voter || !vote.proposalId || vote.amount.lte(0)) {
      throw new Error('Invalid vote parameters');
    }

    // Check voter's token balance
    const balance = await getTokenBalance(vote.voter);
    if (vote.amount.gt(balance)) {
      throw new Error('Insufficient token balance');
    }

    // Add vote to the list
    this.votes.push(vote);

    // Update proposal tallies
    this.tallyVotes(vote.proposalId);
  }

  getProposalState(proposalId: string): ProposalState {
    // Find the proposal
    const proposal = this.proposals.find((p) => p.id === proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }

    // Calculate current timestamp
    const currentTimestamp = Math.floor(Date.now() / 1000);

    // Check if the voting period has ended
    if (currentTimestamp < proposal.voteStart) {
      return ProposalState.Active;
    } else if (currentTimestamp >= proposal.voteEnd) {
      // Tally the votes and check if the proposal passed or failed
      const { yesVotes, noVotes } = this.tallyVotes(proposalId);
      if (yesVotes.gte(proposal.threshold) && yesVotes.gte(proposal.quorum)) {
        return ProposalState.Passed;
      } else {
        return ProposalState.Failed;
      }
    } else {
      return ProposalState.Active;
    }
  }

  private tallyVotes(proposalId: string): VoteTally {
    // Find the proposal
    const proposal = this.proposals.find((p) => p.id === proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }

    // Tally the votes
    let yesVotes = BigNumber.from(0);
    let noVotes = BigNumber.from(0);
    for (const vote of this.votes.filter((v) => v.proposalId === proposalId)) {
      if (vote.support) {
        yesVotes = yesVotes.add(vote.amount);
      } else {
        noVotes = noVotes.add(vote.amount);
      }
    }

    return { yesVotes, noVotes };
  }

  private generateProposalId(): string {
    // Generate a unique proposal ID
    return 'proposal-' + Math.random().toString(36).substring(2, 10);
  }
}

export { Proposal, Vote, ProposalState, VoteTally, VotingModule };
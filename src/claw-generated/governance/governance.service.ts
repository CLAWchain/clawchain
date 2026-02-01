import { Proposal, Vote } from './proposal';

export class GovernanceService {
  private proposals: Proposal[] = [];

  submitProposal(proposal: Proposal): void {
    proposal.id = this.proposals.length + 1;
    proposal.createdAt = new Date();
    this.proposals.push(proposal);
  }

  getProposals(): Proposal[] {
    return this.proposals;
  }

  vote(proposalId: number, vote: Vote): void {
    const proposal = this.proposals.find(p => p.id === proposalId);
    if (proposal) {
      proposal.votes.push(vote);
    }
  }

  calculateVotes(proposalId: number): { approve: number; reject: number } {
    const proposal = this.proposals.find(p => p.id === proposalId);
    if (proposal) {
      let approveVotes = 0;
      let rejectVotes = 0;
      for (const v of proposal.votes) {
        if (v.choice) {
          approveVotes += v.amount;
        } else {
          rejectVotes += v.amount;
        }
      }
      return { approve: approveVotes, reject: rejectVotes };
    }
    return { approve: 0, reject: 0 };
  }

  isProposalApproved(proposalId: number): boolean {
    const { approve, reject } = this.calculateVotes(proposalId);
    const totalSupply = 1000000; // Replace with actual total supply
    return approve / totalSupply >= this.proposals.find(p => p.id === proposalId)?.approvalThreshold;
  }
}
import { VotingContract } from './VotingContract';
import { BigNumber } from 'ethers';
import { StateManager } from '../StateManager';

export class VotingManager {
  private votingContract: VotingContract;
  private stateManager: StateManager;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
    this.votingContract = new VotingContract({
      address: '0x...',
      signer: stateManager.getSigner()
    });
  }

  async createProposal(description: string, endBlock: number): Promise<string> {
    const proposalId = await this.votingContract.createVote(description, endBlock);
    return proposalId;
  }

  async castVote(proposalId: string, support: boolean, weight: BigNumber) {
    await this.votingContract.castVote(proposalId, support, { value: weight });
  }

  async getVote(proposalId: string, voter: string): Promise<{ support: boolean, weight: BigNumber }> {
    return this.votingContract.getVote(proposalId, voter);
  }

  async getProposal(proposalId: string): Promise<{ creator: string, description: string, endBlock: number }> {
    return this.votingContract.getProposal(proposalId);
  }
}
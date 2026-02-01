import { Request, Response } from 'express';
import { GovernanceService } from '../governance/governance.service';
import { Proposal, Vote } from '../governance/proposal';

export class GovernanceController {
  private governanceService = new GovernanceService();

  submitProposal(req: Request, res: Response) {
    const proposal: Proposal = req.body;
    this.governanceService.submitProposal(proposal);
    res.status(201).json(proposal);
  }

  getProposals(req: Request, res: Response) {
    const proposals = this.governanceService.getProposals();
    res.status(200).json(proposals);
  }

  vote(req: Request, res: Response) {
    const { proposalId } = req.params;
    const vote: Vote = req.body;
    this.governanceService.vote(parseInt(proposalId), vote);
    res.status(200).json({ message: 'Vote cast' });
  }
}
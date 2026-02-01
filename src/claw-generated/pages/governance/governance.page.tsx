import React, { useState, useEffect } from 'react';
import { Proposal } from '../../governance/proposal';
import { GovernanceService } from '../../governance/governance.service';

const GovernancePage: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const governanceService = new GovernanceService();

  useEffect(() => {
    setProposals(governanceService.getProposals());
  }, [governanceService]);

  return (
    <div>
      <h1>Governance</h1>
      <h2>Active Proposals</h2>
      <ul>
        {proposals.map(proposal => (
          <li key={proposal.id}>
            <h3>{proposal.title}</h3>
            <p>{proposal.description}</p>
            <p>Author: {proposal.author}</p>
            <p>Voting period: {proposal.voteStartAt.toLocaleString()} - {proposal.voteEndAt.toLocaleString()}</p>
            <p>Approval threshold: {proposal.approvalThreshold * 100}%</p>
            <button>Vote</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GovernancePage;
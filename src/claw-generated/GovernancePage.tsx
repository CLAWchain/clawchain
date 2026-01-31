import React, { useState, useEffect } from 'react';
import { Governance, Proposal } from './Governance.sol';
import { CLAW20 } from './CLAW20.sol';

const GovernancePage: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [newProposal, setNewProposal] = useState('');
  const [votingPeriod, setVotingPeriod] = useState(10000);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProposals = async () => {
      const governance = await Governance__factory.connect(GOVERNANCE_CONTRACT_ADDRESS, provider);
      const proposalCount = await governance.proposalCount();
      const proposals = [];
      for (let i = 0; i < proposalCount; i++) {
        const proposal = await governance.proposals(i);
        proposals.push(proposal);
      }
      setProposals(proposals);
    };
    fetchProposals();
  }, []);

  const createProposal = async () => {
    setIsLoading(true);
    const governance = await Governance__factory.connect(GOVERNANCE_CONTRACT_ADDRESS, signer);
    await governance.createProposal(newProposal, votingPeriod);
    setNewProposal('');
    setIsLoading(false);
  };

  const voteOnProposal = async (proposalId: number, support: boolean) => {
    setIsLoading(true);
    const governance = await Governance__factory.connect(GOVERNANCE_CONTRACT_ADDRESS, signer);
    await governance.vote(proposalId, support);
    setIsLoading(false);
  };

  const executeProposal = async (proposalId: number) => {
    setIsLoading(true);
    const governance = await Governance__factory.connect(GOVERNANCE_CONTRACT_ADDRESS, signer);
    await governance.executeProposal(proposalId);
    setIsLoading(false);
  };

  return (
    <div>
      <h1>Governance</h1>
      <div>
        <input
          type="text"
          value={newProposal}
          onChange={(e) => setNewProposal(e.target.value)}
          placeholder="New Proposal"
        />
        <input
          type="number"
          value={votingPeriod}
          onChange={(e) => setVotingPeriod(parseInt(e.target.value))}
          placeholder="Voting Period (blocks)"
        />
        <button onClick={createProposal} disabled={isLoading}>
          Create Proposal
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Description</th>
            <th>Start Block</th>
            <th>End Block</th>
            <th>For Votes</th>
            <th>Against Votes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {proposals.map((proposal) => (
            <tr key={proposal.id}>
              <td>{proposal.id}</td>
              <td>{proposal.description}</td>
              <td>{proposal.startBlock}</td>
              <td>{proposal.endBlock}</td>
              <td>{proposal.forVotes}</td>
              <td>{proposal.againstVotes}</td>
              <td>
                {proposal.endBlock > block.number && !proposal.executed ? (
                  <>
                    <button onClick={() => voteOnProposal(proposal.id, true)}>Vote For</button>
                    <button onClick={() => voteOnProposal(proposal.id, false)}>Vote Against</button>
                  </>
                ) : proposal.endBlock < block.number && !proposal.executed ? (
                  <button onClick={() => executeProposal(proposal.id)}>Execute</button>
                ) : (
                  'Voting Ended'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GovernancePage;
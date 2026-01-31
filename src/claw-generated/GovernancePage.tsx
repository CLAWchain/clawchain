import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import VotingContract from './Voting';

const GovernancePage: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const [proposals, setProposals] = useState<any[]>([]);
  const [votingPower, setVotingPower] = useState(0);

  useEffect(() => {
    const fetchProposals = async () => {
      const contract = await VotingContract.deploy(address);
      const proposalCount = await contract.proposalCount();
      const proposals = [];
      for (let i = 0; i < proposalCount; i++) {
        const proposal = await contract.proposals(i);
        proposals.push(proposal);
      }
      setProposals(proposals);
      setVotingPower(await contract.votes(address));
    };
    fetchProposals();
  }, [address]);

  const handleVote = async (proposalId: number, support: boolean) => {
    const contract = await VotingContract.deploy(address);
    await contract.vote(proposalId, support);
  };

  return (
    <div>
      <h1>Governance</h1>
      <p>Your voting power: {votingPower}</p>
      <h2>Proposals</h2>
      {proposals.map((proposal, index) => (
        <div key={index}>
          <h3>{proposal.description}</h3>
          <p>Proposed by: {proposal.proposer}</p>
          <p>Voting period: {proposal.startBlock} - {proposal.endBlock}</p>
          <p>Quorum: {proposal.quorum}%</p>
          <button onClick={() => handleVote(index, true)}>Vote For</button>
          <button onClick={() => handleVote(index, false)}>Vote Against</button>
        </div>
      ))}
    </div>
  );
};

export default GovernancePage;
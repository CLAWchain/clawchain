import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ContractVerificationPage: React.FC = () => {
  const [contractSource, setContractSource] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Call backend API to verify contract
      const response = await fetch('/api/contract-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ source: contractSource }),
      });
      const data = await response.json();
      if (response.ok) {
        setVerificationStatus('success');
        // Redirect to contract details page
        navigate(`/contracts/${data.contractAddress}`);
      } else {
        setVerificationStatus('error');
      }
    } catch (error) {
      setVerificationStatus('error');
      console.error('Error verifying contract:', error);
    }
  };

  return (
    <div>
      <h1>Contract Verification</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Contract Source:
          <textarea
            value={contractSource}
            onChange={(e) => setContractSource(e.target.value)}
          ></textarea>
        </label>
        <button type="submit">Verify</button>
      </form>
      {verificationStatus === 'pending' && <div>Verifying contract...</div>}
      {verificationStatus === 'success' && <div>Contract verified successfully!</div>}
      {verificationStatus === 'error' && <div>Error verifying contract. Please try again.</div>}
    </div>
  );
};

export default ContractVerificationPage;
import React, { useState } from 'react';
import axios from 'axios';

const ContractVerification: React.FC = () => {
  const [sourceCode, setSourceCode] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/verify-contract', { sourceCode });
      setVerificationStatus(response.data.status);
    } catch (error) {
      setVerificationStatus('error');
    }
  };

  return (
    <div>
      <h2>Contract Verification</h2>
      <p>Submit your smart contract source code for verification on the ClawChain network.</p>
      <form onSubmit={handleSubmit}>
        <textarea
          value={sourceCode}
          onChange={(e) => setSourceCode(e.target.value)}
          placeholder="Paste your contract source code here"
          rows={10}
        />
        <button type="submit">Verify Contract</button>
      </form>
      {verificationStatus === 'pending' && <p>Verifying contract...</p>}
      {verificationStatus === 'success' && <p>Contract verification successful!</p>}
      {verificationStatus === 'error' && <p>Contract verification failed. Please try again.</p>}
    </div>
  );
};

export default ContractVerification;
import React, { useState } from 'react';
import { useClawChain } from './useClawChain';

interface ContractVerifierProps {
  // Add any necessary props
}

const ContractVerifier: React.FC<ContractVerifierProps> = () => {
  const { verifyContract, contractVerificationStatus, contractVerificationError } = useClawChain();
  const [sourceCode, setSourceCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyContract(sourceCode);
  };

  return (
    <div>
      <h2>Contract Verification</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Contract Source Code:
          <textarea
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            required
          />
        </label>
        <button type="submit">Verify Contract</button>
      </form>
      {contractVerificationStatus === 'pending' && <div>Verifying contract...</div>}
      {contractVerificationStatus === 'success' && <div>Contract verified successfully!</div>}
      {contractVerificationStatus === 'error' && <div>Error: {contractVerificationError}</div>}
    </div>
  );
};

export default ContractVerifier;
import React from 'react';
import ContractVerifier from './ContractVerifier';

const App: React.FC = () => {
  const handleVerify = async (contractCode: string): Promise<VerificationResult> => {
    // Call backend API to verify the contract code
    const response = await fetch('/api/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contractCode }),
    });

    const result: VerificationResult = await response.json();
    return result;
  };

  return (
    <div>
      <h1>ClawChain</h1>
      <ContractVerifier onVerify={handleVerify} />
    </div>
  );
};

interface VerificationResult {
  status: 'pending' | 'passed' | 'failed';
  message: string;
}

export default App;
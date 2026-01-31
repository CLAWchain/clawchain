import React from 'react';
import ContractVerifier from './ContractVerifier';

const App: React.FC = () => {
  const handleVerify = async (sourceCode: string): Promise<boolean> => {
    // Call the contract verification service here
    return true;
  };

  return (
    <div>
      <h1>ClawChain</h1>
      <ContractVerifier onVerify={handleVerify} />
    </div>
  );
};

export default App;
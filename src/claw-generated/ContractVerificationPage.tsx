import React from 'react';
import ContractVerifier from './ContractVerifier';

const ContractVerificationPage: React.FC = () => {
  const handleVerify = (sourceCode: string) => {
    // Call contract verification logic here
    console.log('Verifying contract:', sourceCode);
  };

  return (
    <div>
      <h1>Contract Verification</h1>
      <ContractVerifier onVerify={handleVerify} />
    </div>
  );
};

export default ContractVerificationPage;
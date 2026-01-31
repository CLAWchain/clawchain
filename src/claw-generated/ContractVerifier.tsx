import React, { useState } from 'react';

interface ContractVerifierProps {
  onVerify: (sourceCode: string) => Promise<boolean>;
}

const ContractVerifier: React.FC<ContractVerifierProps> = ({ onVerify }) => {
  const [sourceCode, setSourceCode] = useState('');

  const handleVerify = async () => {
    const isValid = await onVerify(sourceCode);
    if (isValid) {
      console.log('Contract is valid!');
    } else {
      console.log('Contract is invalid.');
    }
  };

  return (
    <div>
      <h2>Contract Verifier</h2>
      <textarea
        value={sourceCode}
        onChange={(e) => setSourceCode(e.target.value)}
        placeholder="Enter contract source code"
      />
      <button onClick={handleVerify}>Verify</button>
    </div>
  );
};

export default ContractVerifier;
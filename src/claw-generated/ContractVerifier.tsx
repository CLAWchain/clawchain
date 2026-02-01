import React, { useState } from 'react';

interface ContractVerifierProps {
  onVerify: (sourceCode: string) => void;
}

const ContractVerifier: React.FC<ContractVerifierProps> = ({ onVerify }) => {
  const [sourceCode, setSourceCode] = useState('');

  const handleSubmit = () => {
    onVerify(sourceCode);
  };

  return (
    <div>
      <h2>Contract Verifier</h2>
      <textarea
        value={sourceCode}
        onChange={(e) => setSourceCode(e.target.value)}
        placeholder="Paste your contract source code here"
      />
      <button onClick={handleSubmit}>Verify Contract</button>
    </div>
  );
};

export default ContractVerifier;
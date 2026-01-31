import React, { useState } from 'react';
import { Button, Input, Textarea, Card, Spinner } from '@claw/ui-kit';

interface ContractVerifierProps {
  onVerify: (contractCode: string) => Promise<VerificationResult>;
}

interface VerificationResult {
  status: 'pending' | 'passed' | 'failed';
  message: string;
}

const ContractVerifier: React.FC<ContractVerifierProps> = ({ onVerify }) => {
  const [contractCode, setContractCode] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const result = await onVerify(contractCode);
      setVerificationResult(result);
    } catch (error) {
      setVerificationResult({
        status: 'failed',
        message: 'Error verifying contract',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card>
      <h2>Contract Verifier</h2>
      <p>Submit your smart contract source code for verification on ClawChain.</p>
      <Textarea
        label="Contract Code"
        value={contractCode}
        onChange={(e) => setContractCode(e.target.value)}
        rows={10}
      />
      <Button onClick={handleVerify} disabled={isVerifying}>
        {isVerifying ? <Spinner /> : 'Verify Contract'}
      </Button>
      {verificationResult && (
        <div>
          <h3>Verification Result: {verificationResult.status}</h3>
          <p>{verificationResult.message}</p>
        </div>
      )}
    </Card>
  );
};

export default ContractVerifier;
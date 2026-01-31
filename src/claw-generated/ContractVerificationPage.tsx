import React, { useState } from 'react';
import { Button, Divider, Input, Result, Typography } from 'antd';
import { useContractVerification } from './api/contract-verification';

const { Title, Text } = Typography;

const ContractVerificationPage: React.FC = () => {
  const [contractSource, setContractSource] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    errors: string[];
  } | null>(null);

  const { verifyContract } = useContractVerification();

  const handleVerify = async () => {
    try {
      const result = await verifyContract(contractSource);
      setVerificationResult(result);
    } catch (error) {
      console.error('Contract verification failed:', error);
      setVerificationResult({
        valid: false,
        errors: ['Contract verification failed. Please try again.'],
      });
    }
  };

  return (
    <div>
      <Title>Contract Verification</Title>
      <Text>
        Submit your smart contract source code to verify it against the ClawChain
        blockchain.
      </Text>
      <Divider />
      <Input.TextArea
        rows={10}
        placeholder="Enter your contract source code"
        value={contractSource}
        onChange={(e) => setContractSource(e.target.value)}
      />
      <Button type="primary" onClick={handleVerify}>
        Verify Contract
      </Button>
      {verificationResult && (
        <div>
          <Divider />
          {verificationResult.valid ? (
            <Result status="success" title="Contract Verified" />
          ) : (
            <Result
              status="error"
              title="Contract Verification Failed"
              subTitle={
                <ul>
                  {verificationResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              }
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ContractVerificationPage;
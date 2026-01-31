import React, { useState } from 'react';
import { Button, Divider, Input, Result, Typography, Upload } from 'antd';
import { useContractVerification } from './api/contract-verification';
import { UploadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ContractVerificationPage: React.FC = () => {
  const [contractSource, setContractSource] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);

  const { verifyContract } = useContractVerification();

  const handleFileUpload = (info: any) => {
    if (info.file.status === 'done') {
      setContractSource(info.file.response);
    }
  };

  const handleVerify = async () => {
    try {
      const result = await verifyContract(contractSource);
      setVerificationResult(result);
    } catch (error) {
      console.error('Contract verification failed:', error);
      setVerificationResult({
        valid: false,
        errors: ['Contract verification failed. Please try again.'],
        warnings: [],
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
      <Upload
        name="contract-source"
        action="/api/contract-verification"
        onChange={handleFileUpload}
        showUploadList={false}
      >
        <Button icon={<UploadOutlined />}>Upload Contract Source</Button>
      </Upload>
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
                <>
                  <p>Errors:</p>
                  <ul>
                    {verificationResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                  {verificationResult.warnings.length > 0 && (
                    <>
                      <p>Warnings:</p>
                      <ul>
                        {verificationResult.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </>
              }
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ContractVerificationPage;
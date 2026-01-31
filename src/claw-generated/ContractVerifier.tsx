import React, { useState } from 'react';
import axios from 'axios';

interface VerificationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const ContractVerifier: React.FC = () => {
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const verifyContract = async (contractCode: string): Promise<VerificationResult> => {
    try {
      const response = await axios.post('/api/contract-verification', { contractCode });
      return response.data;
    } catch (error) {
      console.error('Contract verification failed:', error);
      return {
        valid: false,
        errors: ['Contract verification failed. Please try again.'],
        warnings: [],
      };
    }
  };

  return {
    verifyContract,
    verificationResult,
  };
};

export default ContractVerifier;
export { VerificationResult };
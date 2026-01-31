import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

interface ContractVerificationState {
  sourceCode: string;
  isVerifying: boolean;
  verificationResult: 'pending' | 'success' | 'failure';
  errorMessage: string;
}

const ContractVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<ContractVerificationState>({
    sourceCode: '',
    isVerifying: false,
    verificationResult: 'pending',
    errorMessage: '',
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setState((prevState) => ({
          ...prevState,
          sourceCode: reader.result as string,
        }));
      };
      reader.readAsText(file);
    }
  };

  const handleVerifyContract = async () => {
    setState((prevState) => ({
      ...prevState,
      isVerifying: true,
      verificationResult: 'pending',
      errorMessage: '',
    }));

    try {
      // Call backend API to verify contract
      const response = await fetch('/api/verify-contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sourceCode: state.sourceCode }),
      });

      if (response.ok) {
        const result = await response.json();
        setState((prevState) => ({
          ...prevState,
          isVerifying: false,
          verificationResult: 'success',
        }));
      } else {
        const error = await response.json();
        setState((prevState) => ({
          ...prevState,
          isVerifying: false,
          verificationResult: 'failure',
          errorMessage: error.message,
        }));
      }
    } catch (error) {
      setState((prevState) => ({
        ...prevState,
        isVerifying: false,
        verificationResult: 'failure',
        errorMessage: 'An error occurred during contract verification.',
      }));
    }
  };

  return (
    <div className="container my-5">
      <h1 className="mb-4">Contract Verification</h1>
      <div className="mb-4">
        <label htmlFor="contract-source-code" className="form-label">
          Upload or paste your contract source code:
        </label>
        <div className="input-group">
          <label className="input-group-text" htmlFor="contract-source-code">
            <FontAwesomeIcon icon={faUpload} />
          </label>
          <input
            type="file"
            className="form-control"
            id="contract-source-code"
            onChange={handleFileUpload}
          />
        </div>
      </div>
      <Button
        variant="primary"
        onClick={handleVerifyContract}
        disabled={state.isVerifying || state.sourceCode.trim() === ''}
      >
        {state.isVerifying ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
            <span className="ms-2">Verifying...</span>
          </>
        ) : (
          'Verify Contract'
        )}
      </Button>
      {state.verificationResult !== 'pending' && (
        <div className="mt-4">
          {state.verificationResult === 'success' ? (
            <Alert variant="success">
              <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
              Contract verification successful!
            </Alert>
          ) : (
            <Alert variant="danger">
              <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
              Contract verification failed: {state.errorMessage}
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};

export default ContractVerificationPage;
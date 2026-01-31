import { Request, Response } from 'express';
import { Verifier } from '../VerifierContract';
import validator from 'validator';

export const handleContractVerification = async (req: Request, res: Response) => {
  let { source } = req.body;

  // Validate the source code input
  if (!source || typeof source !== 'string' || source.length > 1000000) {
    return res.status(400).json({ error: 'Invalid contract source code' });
  }

  try {
    // Compile the contract source code
    const compiled = await Verifier.compileContract(source);

    // Verify the contract against the ClawChain protocol
    const isValid = await Verifier.verifyContract(compiled);

    if (isValid) {
      res.status(200).json({ contractAddress: compiled.address });
    } else {
      res.status(400).json({ error: 'Contract is not valid' });
    }
  } catch (error) {
    console.error('Error verifying contract:', error);
    res.status(500).json({ error: 'Error verifying contract' });
  }
};
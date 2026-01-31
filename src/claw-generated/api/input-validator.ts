import { Request, Response, NextFunction } from 'express';

export const validateTransactionHash = (req: Request, res: Response, next: NextFunction) => {
  const { hash } = req.params;

  // Check that the hash is a valid hex string
  if (!/^[0-9a-fA-F]+$/.test(hash)) {
    return res.status(400).json({ error: 'Invalid transaction hash' });
  }

  // Check that the hash is the correct length (e.g., 64 characters for a 32-byte hash)
  if (hash.length !== 64) {
    return res.status(400).json({ error: 'Transaction hash must be 64 characters long' });
  }

  next();
};

export const validateContractVerificationInput = (req: Request, res: Response, next: NextFunction) => {
  const { contractAddress, bytecode, abi } = req.body;

  // Check that the contract address is a valid hex string
  if (!/^0x[0-9a-fA-F]+$/.test(contractAddress)) {
    return res.status(400).json({ error: 'Invalid contract address' });
  }

  // Check that the bytecode and ABI are valid JSON
  try {
    JSON.parse(bytecode);
    JSON.parse(abi);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid bytecode or ABI' });
  }

  next();
};
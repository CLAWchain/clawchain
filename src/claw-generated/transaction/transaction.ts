import { ZkSNARKVerifier } from '../crypto';

export class Transaction {
  constructor(
    public readonly proof: Proof,
    public readonly verificationKey: VerificationKey
  ) {}

  verify(): boolean {
    const verifier = new ZkSNARKVerifier();
    return verifier.verify(this.proof, this.verificationKey);
  }
}

export type Proof = any;
export type VerificationKey = any;
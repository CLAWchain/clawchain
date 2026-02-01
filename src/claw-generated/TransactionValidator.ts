import { Transaction } from './Transaction';
import { ZkSnarkVerifier } from './ZkSnarkVerifier';

export class TransactionValidator {
  static verifyTransaction(transaction: Transaction): boolean {
    // Verify the zk-SNARK proof
    const verifier = new ZkSnarkVerifier();
    return verifier.verify(transaction.proof);
  }
}
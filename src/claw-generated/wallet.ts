import { Transaction } from './transaction';
import { Signer } from '../crypto/signer';

class Wallet {
  private signers: Signer[];
  private transactions: Transaction[];

  constructor(signers: Signer[]) {
    this.signers = signers;
    this.transactions = [];
  }

  addTransaction(tx: Transaction) {
    this.transactions.push(tx);
  }

  verifyTransaction(tx: Transaction): boolean {
    // Verify that the required number of signers have signed the transaction
    let signatureCount = 0;
    for (const input of tx.inputs) {
      if (input.wallet === this) {
        for (const signer of input.signers) {
          if (this.signers.includes(signer)) {
            signatureCount++;
          }
        }
      }
    }

    // Require at least M-of-N signers to approve the transaction
    const M = 2; // Require 2-of-N signatures
    return signatureCount >= M;
  }
}

export { Wallet };
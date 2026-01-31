import { Transaction } from '../transaction/transaction';
import { Account } from '../account/account';
import { Signature } from '../crypto/signature';

export class Wallet {
  private accounts: Account[];
  private signers: Account[];
  private requiredSignatures: number;

  constructor(accounts: Account[], requiredSignatures: number) {
    this.accounts = accounts;
    this.signers = accounts;
    this.requiredSignatures = requiredSignatures;
  }

  addSigner(account: Account) {
    this.signers.push(account);
  }

  removeSigner(account: Account) {
    this.signers = this.signers.filter(signer => signer !== account);
  }

  setRequiredSignatures(count: number) {
    this.requiredSignatures = count;
  }

  async signTransaction(tx: Transaction): Promise<void> {
    const signatures: Signature[] = [];
    for (const signer of this.signers) {
      const signature = await signer.sign(tx.hash());
      signatures.push(signature);
      if (signatures.length >= this.requiredSignatures) {
        break;
      }
    }
    tx.addMultiSignature(signatures);
  }

  async verifyTransaction(tx: Transaction): Promise<boolean> {
    const signatures = tx.getMultiSignatures();
    if (signatures.length < this.requiredSignatures) {
      return false;
    }

    for (const signer of this.signers) {
      let validSignatures = 0;
      for (const signature of signatures) {
        if (await signer.verify(tx.hash(), signature)) {
          validSignatures++;
          if (validSignatures >= this.requiredSignatures) {
            return true;
          }
        }
      }
    }

    return false;
  }
}
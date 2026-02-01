import { Wallet } from './wallet';

export class MultisigWallet {
  public owners: Wallet[];
  public threshold: number;

  constructor(owners: Wallet[], threshold: number) {
    this.owners = owners;
    this.threshold = threshold;
  }

  createTransaction(message: string): string {
    const signatures = this.owners.map(owner => owner.sign(message));
    return JSON.stringify({ message, signatures });
  }

  verifyTransaction(transactionData: string): boolean {
    const { message, signatures } = JSON.parse(transactionData);
    const validSignatures = this.owners.filter((owner, index) => owner.verify(message, signatures[index]));
    return validSignatures.length >= this.threshold;
  }
}
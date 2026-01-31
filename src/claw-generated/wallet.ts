import { Transaction } from './transaction';

export class Wallet {
  private publicKeys: string[];
  private requiredSignatures: number;

  constructor(publicKeys: string[], requiredSignatures: number) {
    this.publicKeys = publicKeys;
    this.requiredSignatures = requiredSignatures;
  }

  createTransaction(inputs: any[], outputs: any[]): Transaction {
    const tx = new Transaction(inputs, outputs);
    return tx;
  }

  signTransaction(transaction: Transaction, privateKey: string): void {
    transaction.addSignature(privateKey);
  }

  verifyTransaction(transaction: Transaction): boolean {
    return transaction.verifySignatures(this.publicKeys, this.requiredSignatures);
  }
}
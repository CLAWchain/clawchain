import { Transaction, TransactionManager } from '../transaction/transaction';
import { Account } from '../account/account';
import { AggregateSignature, VerifyAggregateSignature } from './signature-aggregation';

export class MultisigWallet {
  private owners: Account[];
  private threshold: number;

  constructor(owners: Account[], threshold: number) {
    this.owners = owners;
    this.threshold = threshold;
  }

  createTransaction(from: Account, to: Account, amount: number, nonce: number): Transaction {
    const transaction = TransactionManager.createTransaction(from, to, amount, nonce);
    return transaction;
  }

  signTransaction(transaction: Transaction, privateKey: string): Transaction {
    return TransactionManager.signTransaction(transaction, privateKey);
  }

  verifyTransaction(transaction: Transaction): boolean {
    const requiredSignatures = this.owners.slice(0, this.threshold);
    const aggregatedSignature = AggregateSignature(
      requiredSignatures.map(owner => TransactionManager.signTransaction(transaction, owner.privateKey).signature)
    );
    return VerifyAggregateSignature(transaction, aggregatedSignature);
  }

  submitTransaction(transaction: Transaction): boolean {
    if (this.verifyTransaction(transaction)) {
      // TODO: Broadcast the transaction to the network
      return true;
    }
    return false;
  }
}
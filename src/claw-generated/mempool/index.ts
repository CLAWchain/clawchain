import { Transaction } from '../transactions';
import { Wallet } from '../wallet';

export class Mempool {
  private transactions: Transaction[] = [];
  private wallets: Map<string, Wallet> = new Map();

  addTransaction(transaction: Transaction): boolean {
    // Get the wallet for the transaction sender
    const senderPublicKey = transaction.inputs[0].publicKey;
    const wallet = this.wallets.get(senderPublicKey.toString());
    if (!wallet) {
      return false;
    }

    // Verify the transaction nonce is greater than the wallet's current nonce
    if (transaction.nonce <= wallet.getNonce()) {
      return false;
    }

    // Verify the transaction signature before adding to the mempool
    if (!transaction.verifySignature()) {
      return false;
    }

    this.transactions.push(transaction);
    wallet.setNonce(transaction.nonce);
    return true;
  }

  getTransactions(): Transaction[] {
    return this.transactions;
  }

  registerWallet(wallet: Wallet): void {
    this.wallets.set(wallet.getPublicKey().toString(), wallet);
  }
}
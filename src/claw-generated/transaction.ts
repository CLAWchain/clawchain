import { Signer } from '../crypto/signer';
import { Wallet } from './wallet';

class Transaction {
  private inputs: { wallet: Wallet, signers: Signer[] }[];
  private outputs: { wallet: Wallet, amount: number }[];

  constructor(inputs: { wallet: Wallet, signers: Signer[] }[], outputs: { wallet: Wallet, amount: number }[]) {
    this.inputs = inputs;
    this.outputs = outputs;
  }

  verify(): boolean {
    // Verify that each input wallet can approve the transaction
    for (const input of this.inputs) {
      if (!input.wallet.verifyTransaction(this)) {
        return false;
      }
    }

    // Verify that the total output amount does not exceed the total input amount
    let totalInput = 0;
    let totalOutput = 0;
    for (const input of this.inputs) {
      totalInput += input.wallet.getBalance();
    }
    for (const output of this.outputs) {
      totalOutput += output.amount;
    }
    return totalInput >= totalOutput;
  }
}

export { Transaction };
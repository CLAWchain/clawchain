import { Transaction } from './transaction';
import { Network } from '../network';

export class Wallet {
  constructor(
    private readonly privateKey: string,
    private readonly publicKey: string
  ) {}

  sendTransaction(to: string, amount: number, nonce: number): void {
    const tx = new Transaction(this.publicKey, to, amount, nonce, '');
    tx.sign(this.privateKey);
    Network.broadcastTransaction(tx);
  }
}
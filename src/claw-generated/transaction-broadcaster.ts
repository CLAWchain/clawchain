import { Transaction, SignedTransaction } from './transaction';
import { Wallet } from './wallet';

export class TransactionBroadcaster {
  broadcast(signedTransaction: SignedTransaction): void {
    // TODO: Implement transaction broadcast to the network
    console.log('Broadcasting signed transaction:', signedTransaction);
  }
}
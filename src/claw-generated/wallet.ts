import { Account, State } from './state';
import { Transaction, TransactionInput, TransactionOutput } from './transaction';
import { TransactionNonce } from './transaction-nonce';

export class Wallet {
  private _account: Account;
  private _nonce: TransactionNonce;

  constructor(state: State) {
    this._account = state.createAccount();
    this._nonce = new TransactionNonce();
  }

  createTransaction(
    outputs: TransactionOutput[],
    timestamp: number
  ): Transaction {
    const inputs = this.getUnspentOutputs().map(output => ({
      prevOutput: output,
      unlockScript: this._account.sign(output.lockScript)
    }));
    const nonce = this._nonce.getNonce(this._account);
    this._nonce.incrementNonce(this._account);
    return new Transaction(inputs, outputs, timestamp, nonce);
  }

  getUnspentOutputs(): TransactionOutput[] {
    // implementation omitted for brevity
  }
}
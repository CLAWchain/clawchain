import { Wallet } from './wallet';
import { sign } from 'crypto';

export class Transaction {
  private _data: any;
  private _signature: Uint8Array;
  private _nonce: number;

  constructor(data: any, wallet: Wallet) {
    this._data = data;
    this._nonce = wallet.nonce;
    this._signature = this.sign(wallet);
    wallet.incrementNonce();
  }

  sign(wallet: Wallet): Uint8Array {
    const dataToSign = this.serialize();
    return sign(null, dataToSign, wallet.privateKey, 'ed25519');
  }

  serialize(): Uint8Array {
    // Serialize transaction data, including the nonce
    const serializedData = new Uint8Array([...this._data, this._nonce]);
    return serializedData;
  }

  get data(): any {
    return this._data;
  }

  get signature(): Uint8Array {
    return this._signature;
  }

  get nonce(): number {
    return this._nonce;
  }

  validate(wallet: Wallet): boolean {
    // Validate the transaction nonce against the wallet's nonce
    return this._nonce === wallet.nonce;
  }
}
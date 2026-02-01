import { Wallet } from './wallet';
import { sign } from 'crypto';

export class Transaction {
  private _data: any;
  private _signature: Uint8Array;

  constructor(data: any, wallet: Wallet) {
    this._data = data;
    this._signature = this.sign(wallet);
  }

  sign(wallet: Wallet): Uint8Array {
    const dataToSign = this.serialize();
    return sign(null, dataToSign, wallet.privateKey, 'ed25519');
  }

  serialize(): Uint8Array {
    // TODO: Implement transaction serialization
    return new Uint8Array();
  }

  get data(): any {
    return this._data;
  }

  get signature(): Uint8Array {
    return this._signature;
  }
}
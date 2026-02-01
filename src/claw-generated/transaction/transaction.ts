import { Wallet } from '../wallet';
import * as sodium from 'libsodium-wrappers';

export class Transaction {
  sender: Uint8Array;
  recipient: Uint8Array;
  amount: number;
  fee: number; // New fee property
  timestamp: number;
  nonce: number;
  signature: Uint8Array;

  constructor(sender: Uint8Array, recipient: Uint8Array, amount: number, fee: number, nonce: number) {
    this.sender = sender;
    this.recipient = recipient;
    this.amount = amount;
    this.fee = fee; // Initialize fee
    this.timestamp = Date.now();
    this.nonce = nonce;
  }

  serialize(): Uint8Array {
    const data = new Uint8Array([
      ...this.sender,
      ...this.recipient,
      ...new Uint8Array(this.amount.toString().split('').map(Number)),
      ...new Uint8Array(this.fee.toString().split('').map(Number)), // Include fee
      ...new Uint8Array(this.timestamp.toString().split('').map(Number)),
      ...new Uint8Array(this.nonce.toString().split('').map(Number))
    ]);
    return data;
  }

  sign(wallet: Wallet): void {
    this.signature = sodium.crypto_sign_detached(this.serialize(), wallet.getPrivateKey());
  }

  verify(wallet: Wallet, lastNonce: number): boolean {
    return this.nonce > lastNonce &&
           sodium.crypto_sign_verify_detached(this.signature, this.serialize(), wallet.getPublicKey());
  }
}
import { PublicKey } from '@solana/web3.js';

export class Account {
  pubkey: PublicKey;
  balance: number;
  nonce: number;

  constructor(pubkey: PublicKey, balance: number, nonce: number) {
    this.pubkey = pubkey;
    this.balance = balance;
    this.nonce = nonce;
  }
}
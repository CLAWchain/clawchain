import { PublicKey } from '@solana/web3.js';

export class Account {
  pubkey: PublicKey;
  balance: number;

  constructor(pubkey: PublicKey, balance: number) {
    this.pubkey = pubkey;
    this.balance = balance;
  }
}
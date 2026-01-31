// src/claw-generated/wallet/index.ts

import { secp256k1, ed25519 } from './signing';

export class Wallet {
  private privateKey: Buffer;

  constructor(privateKey: Buffer) {
    this.privateKey = privateKey;
  }

  signTransactionWithSecp256k1(txData: Buffer): Buffer {
    return secp256k1.sign(this.privateKey, txData);
  }

  signTransactionWithEd25519(txData: Buffer): Buffer {
    return ed25519.sign(this.privateKey, txData);
  }
}

export { secp256k1, ed25519 } from './signing';
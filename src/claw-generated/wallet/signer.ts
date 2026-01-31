import { Transaction } from '../types';
import { KeyPair } from './keypair';

abstract class Signer {
  protected keyPair: KeyPair;

  constructor(keyPair: KeyPair) {
    this.keyPair = keyPair;
  }

  abstract signTransaction(tx: Transaction): Transaction;
  protected abstract hashTransaction(tx: Transaction): Buffer;
}

export { Signer };
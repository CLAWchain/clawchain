import { Keypair, ecdsa } from '../crypto';

export class TransactionSigner {
  constructor(private keypair: Keypair) {}

  signTransaction(tx: Transaction): Signature {
    const signature = ecdsa.sign(tx, this.keypair.privateKey);
    return {
      value: signature,
      publicKey: this.keypair.publicKey,
      scheme: 'ECDSA'
    };
  }

  supportedSchemes(): string[] {
    return ['ECDSA'];
  }
}

export interface Transaction {
  sender: string;
  recipient: string;
  amount: number;
  data?: string;
}

export interface Signature {
  value: string;
  publicKey: string;
  scheme: string;
}
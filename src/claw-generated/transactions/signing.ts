import { ec as EC } from 'elliptic';
import { keccak256 } from 'js-sha3';

// Supported signature schemes
export type SignatureScheme = 'ecdsa' | 'eddsa';

export interface SignedTransaction {
  r: string;
  s: string;
  v: number;
}

export class TransactionSigner {
  private ec: EC;

  constructor(signatureScheme: SignatureScheme = 'ecdsa') {
    if (signatureScheme === 'ecdsa') {
      this.ec = new EC('secp256k1');
    } else {
      // TODO: Implement EdDSA support
      throw new Error('EdDSA not implemented yet');
    }
  }

  sign(transaction: any, privateKey: string): SignedTransaction {
    const key = this.ec.keyFromPrivate(privateKey, 'hex');
    const digest = keccak256(JSON.stringify(transaction));
    const signature = key.sign(digest);

    return {
      r: signature.r.toString(16),
      s: signature.s.toString(16),
      v: signature.recoveryParam! + 27
    };
  }

  verify(transaction: any, publicKey: string, signature: SignedTransaction): boolean {
    const key = this.ec.keyFromPublic(publicKey, 'hex');
    const digest = keccak256(JSON.stringify(transaction));
    return key.verify(digest, {
      r: signature.r,
      s: signature.s,
      recoveryParam: signature.v - 27
    });
  }
}
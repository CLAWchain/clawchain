import { ec as EC } from 'elliptic';
import { keccak256 } from 'js-sha3';
import { ed25519 } from '../crypto/ed25519';

// Supported signature schemes
export type SignatureScheme = 'ecdsa' | 'eddsa';

export interface SignedTransaction {
  r: string;
  s: string;
  v: number;
}

export class TransactionSigner {
  private ec: EC;
  private useEd25519: boolean;

  constructor(signatureScheme: SignatureScheme = 'ecdsa') {
    if (signatureScheme === 'ecdsa') {
      this.ec = new EC('secp256k1');
      this.useEd25519 = false;
    } else {
      this.useEd25519 = true;
    }
  }

  sign(transaction: any, privateKey: string): SignedTransaction {
    if (this.useEd25519) {
      const signature = ed25519.sign(JSON.stringify(transaction), privateKey);
      return {
        r: signature.slice(0, 64),
        s: signature.slice(64, 128),
        v: 0
      };
    } else {
      const key = this.ec.keyFromPrivate(privateKey, 'hex');
      const digest = keccak256(JSON.stringify(transaction));
      const signature = key.sign(digest);

      return {
        r: signature.r.toString(16),
        s: signature.s.toString(16),
        v: signature.recoveryParam! + 27
      };
    }
  }

  verify(transaction: any, publicKey: string, signature: SignedTransaction): boolean {
    if (this.useEd25519) {
      const signatureBytes = Buffer.from(signature.r + signature.s, 'hex');
      return ed25519.verify(JSON.stringify(transaction), publicKey, signatureBytes);
    } else {
      const key = this.ec.keyFromPublic(publicKey, 'hex');
      const digest = keccak256(JSON.stringify(transaction));
      return key.verify(digest, {
        r: signature.r,
        s: signature.s,
        recoveryParam: signature.v - 27
      });
    }
  }
}
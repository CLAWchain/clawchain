import { Buffer } from 'buffer';
import { SignatureScheme } from './signing';
import * as elliptic from 'elliptic';

const ec = new elliptic.ec('secp256k1');

export const ECDSAScheme: SignatureScheme = {
  name: 'ECDSA',
  sign(privateKey: Buffer, data: Buffer): Buffer {
    const key = ec.keyFromPrivate(privateKey);
    const signature = key.sign(data);
    return Buffer.from(signature.toDER());
  },
  verify(publicKey: Buffer, signature: Buffer, data: Buffer): boolean {
    const key = ec.keyFromPublic(publicKey);
    const sig = ec.signature.fromDER(signature);
    return key.verify(data, sig);
  }
};
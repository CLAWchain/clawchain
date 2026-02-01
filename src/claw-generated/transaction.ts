import * as nacl from 'tweetnacl';
import * as bs58 from 'bs58';

export interface Transaction {
  id: string;
  fromPublicKey: string;
  toPublicKey: string;
  amount: number;
  signature: string;
}

export function verifyTransactionSignature(tx: Transaction): boolean {
  const publicKey = bs58.decode(tx.fromPublicKey);
  const signature = bs58.decode(tx.signature);

  return nacl.sign.detached.verify(
    Buffer.from(JSON.stringify(tx), 'utf8'),
    signature,
    publicKey
  );
}
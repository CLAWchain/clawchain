import { KeyPair, generateKeyPair, verifySignature } from './keypair';

export interface Transaction {
  from: Uint8Array;
  to: Uint8Array;
  amount: number;
  timestamp: number;
  signature: Uint8Array;
}

export function createTransaction(
  from: KeyPair,
  to: Uint8Array,
  amount: number
): Transaction {
  const timestamp = Date.now();
  const unsignedTx = { from: from.publicKey, to, amount, timestamp };
  const signature = sign(JSON.stringify(unsignedTx), from.privateKey);
  return { ...unsignedTx, signature };
}

export function verifyTransaction(tx: Transaction): boolean {
  const { from, to, amount, timestamp, signature } = tx;
  const unsignedTx = { from, to, amount, timestamp };
  return verifySignature(
    Buffer.from(JSON.stringify(unsignedTx)),
    signature,
    from
  );
}

export function serializeTransaction(tx: Transaction): string {
  return JSON.stringify(tx);
}

export function deserializeTransaction(
  serializedTx: string
): Transaction {
  return JSON.parse(serializedTx);
}
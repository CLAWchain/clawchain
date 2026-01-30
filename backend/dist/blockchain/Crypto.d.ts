import { Transaction } from './Block';
export declare function bytesToBase58(bytes: Buffer): string;
export declare function base58ToBytes(base58: string): Buffer;
export declare function generateKeypair(): {
    publicKey: string;
    privateKey: string;
};
export declare function derivePublicKey(privateKeyBase58: string): string;
export declare function sign(message: string, privateKeyBase58: string): string;
export declare function verify(message: string, signatureBase58: string, publicKeyBase58: string): boolean;
export declare function createTransactionMessage(tx: Omit<Transaction, 'hash' | 'signature'>): string;
export declare function verifyTransactionSignature(tx: Transaction): boolean;
export declare function signTransaction(tx: Omit<Transaction, 'hash' | 'signature'>, privateKey: string): {
    signature: string;
    hash: string;
};
export declare function generateTestAddress(): string;
export declare function sha256Base58(data: string): string;
//# sourceMappingURL=Crypto.d.ts.map
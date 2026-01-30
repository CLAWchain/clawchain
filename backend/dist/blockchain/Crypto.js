"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bytesToBase58 = bytesToBase58;
exports.base58ToBytes = base58ToBytes;
exports.generateKeypair = generateKeypair;
exports.derivePublicKey = derivePublicKey;
exports.sign = sign;
exports.verify = verify;
exports.createTransactionMessage = createTransactionMessage;
exports.verifyTransactionSignature = verifyTransactionSignature;
exports.signTransaction = signTransaction;
exports.generateTestAddress = generateTestAddress;
exports.sha256Base58 = sha256Base58;
const crypto_1 = __importDefault(require("crypto"));
// Base58 alphabet (Solana style)
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
// Convert bytes to base58
function bytesToBase58(bytes) {
    let num = BigInt('0x' + bytes.toString('hex'));
    let result = '';
    while (num > 0n) {
        const remainder = Number(num % 58n);
        result = BASE58_ALPHABET[remainder] + result;
        num = num / 58n;
    }
    // Add leading '1's for each leading zero byte
    for (const byte of bytes) {
        if (byte === 0) {
            result = '1' + result;
        }
        else {
            break;
        }
    }
    return result || '1';
}
// Convert base58 to bytes
function base58ToBytes(base58) {
    let num = 0n;
    for (const char of base58) {
        const index = BASE58_ALPHABET.indexOf(char);
        if (index === -1)
            throw new Error(`Invalid base58 character: ${char}`);
        num = num * 58n + BigInt(index);
    }
    const hex = num.toString(16).padStart(64, '0');
    const bytes = Buffer.from(hex, 'hex');
    // Add leading zeros
    let leadingZeros = 0;
    for (const char of base58) {
        if (char === '1')
            leadingZeros++;
        else
            break;
    }
    return Buffer.concat([Buffer.alloc(leadingZeros), bytes]);
}
// Generate Ed25519 keypair
function generateKeypair() {
    const { publicKey, privateKey } = crypto_1.default.generateKeyPairSync('ed25519');
    const pubKeyDer = publicKey.export({ type: 'spki', format: 'der' });
    const privKeyDer = privateKey.export({ type: 'pkcs8', format: 'der' });
    // Extract raw 32-byte keys from DER format
    const pubKeyRaw = pubKeyDer.slice(-32);
    const privKeyRaw = privKeyDer.slice(-32);
    return {
        publicKey: bytesToBase58(pubKeyRaw),
        privateKey: bytesToBase58(privKeyRaw)
    };
}
// Derive public key (address) from private key
function derivePublicKey(privateKeyBase58) {
    try {
        const privKeyBytes = base58ToBytes(privateKeyBase58);
        // Create key object from raw bytes
        const privateKey = crypto_1.default.createPrivateKey({
            key: Buffer.concat([
                // PKCS8 header for Ed25519
                Buffer.from('302e020100300506032b657004220420', 'hex'),
                privKeyBytes.slice(0, 32)
            ]),
            format: 'der',
            type: 'pkcs8'
        });
        const publicKey = crypto_1.default.createPublicKey(privateKey);
        const pubKeyDer = publicKey.export({ type: 'spki', format: 'der' });
        const pubKeyRaw = pubKeyDer.slice(-32);
        return bytesToBase58(pubKeyRaw);
    }
    catch (error) {
        console.error('[CRYPTO] Failed to derive public key:', error);
        throw error;
    }
}
// Sign a message with Ed25519
function sign(message, privateKeyBase58) {
    try {
        const privKeyBytes = base58ToBytes(privateKeyBase58);
        const privateKey = crypto_1.default.createPrivateKey({
            key: Buffer.concat([
                Buffer.from('302e020100300506032b657004220420', 'hex'),
                privKeyBytes.slice(0, 32)
            ]),
            format: 'der',
            type: 'pkcs8'
        });
        const signature = crypto_1.default.sign(null, Buffer.from(message), privateKey);
        return bytesToBase58(signature);
    }
    catch (error) {
        console.error('[CRYPTO] Signing failed:', error);
        throw error;
    }
}
// Verify Ed25519 signature
function verify(message, signatureBase58, publicKeyBase58) {
    try {
        const signatureBytes = base58ToBytes(signatureBase58);
        const pubKeyBytes = base58ToBytes(publicKeyBase58);
        const publicKey = crypto_1.default.createPublicKey({
            key: Buffer.concat([
                // SPKI header for Ed25519
                Buffer.from('302a300506032b6570032100', 'hex'),
                pubKeyBytes.slice(0, 32)
            ]),
            format: 'der',
            type: 'spki'
        });
        return crypto_1.default.verify(null, Buffer.from(message), publicKey, signatureBytes);
    }
    catch (error) {
        console.error('[CRYPTO] Signature verification failed:', error);
        return false;
    }
}
// Create transaction message for signing (excludes signature and hash)
function createTransactionMessage(tx) {
    return JSON.stringify({
        from: tx.from,
        to: tx.to,
        value: tx.value.toString(),
        gasPrice: tx.gasPrice.toString(),
        gasLimit: tx.gasLimit.toString(),
        nonce: tx.nonce,
        data: tx.data || ''
    });
}
// Verify transaction signature
function verifyTransactionSignature(tx) {
    try {
        const message = createTransactionMessage(tx);
        // The 'from' address IS the public key in our system (like Solana)
        return verify(message, tx.signature, tx.from);
    }
    catch (error) {
        console.error('[CRYPTO] Transaction signature verification failed:', error);
        return false;
    }
}
// Sign a transaction
function signTransaction(tx, privateKey) {
    const message = createTransactionMessage(tx);
    const signature = sign(message, privateKey);
    // Hash includes the signature
    const hashData = JSON.stringify({
        ...tx,
        value: tx.value.toString(),
        gasPrice: tx.gasPrice.toString(),
        gasLimit: tx.gasLimit.toString(),
        signature
    });
    const hash = bytesToBase58(crypto_1.default.createHash('sha256').update(hashData).digest());
    return { signature, hash };
}
// Generate a random address for testing
function generateTestAddress() {
    const bytes = crypto_1.default.randomBytes(32);
    return bytesToBase58(bytes);
}
// Hash data with SHA256 and return base58
function sha256Base58(data) {
    const hash = crypto_1.default.createHash('sha256').update(data).digest();
    return bytesToBase58(hash);
}
console.log('[CRYPTO] Ed25519 cryptographic utilities loaded');
//# sourceMappingURL=Crypto.js.map
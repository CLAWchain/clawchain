"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Block = void 0;
exports.generateHash = generateHash;
exports.generateRandomBase58 = generateRandomBase58;
exports.hexToBase58 = hexToBase58;
const crypto_1 = __importDefault(require("crypto"));
// Base58 alphabet (Solana style - no 0, O, I, l)
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
// Convert hex to base58
function hexToBase58(hex) {
    const bytes = Buffer.from(hex, 'hex');
    let num = BigInt('0x' + hex);
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
// Generate Solana-style hash
function generateHash(data) {
    const hash = crypto_1.default.createHash('sha256').update(data).digest('hex');
    return hexToBase58(hash);
}
// Generate random base58 string
function generateRandomBase58(length = 44) {
    const bytes = crypto_1.default.randomBytes(32);
    return hexToBase58(bytes.toString('hex')).substring(0, length);
}
class Block {
    constructor(height, parentHash, producer, transactions, difficulty = 1) {
        this.transactions = transactions;
        const gasUsed = this.calculateGasUsed();
        const transactionsRoot = this.calculateMerkleRoot(transactions.map(tx => tx.hash));
        this.header = {
            height,
            hash: '', // Will be calculated
            parentHash,
            producer,
            timestamp: Date.now(),
            nonce: 0,
            difficulty,
            gasUsed,
            gasLimit: 30000000n,
            stateRoot: this.calculateStateRoot(),
            transactionsRoot,
            receiptsRoot: this.calculateReceiptsRoot()
        };
        this.header.hash = this.calculateHash();
    }
    calculateHash() {
        const data = JSON.stringify({
            height: this.header.height,
            parentHash: this.header.parentHash,
            producer: this.header.producer,
            timestamp: this.header.timestamp,
            nonce: this.header.nonce,
            transactionsRoot: this.header.transactionsRoot,
            stateRoot: this.header.stateRoot
        });
        return generateHash(data);
    }
    calculateGasUsed() {
        return this.transactions.reduce((sum, tx) => sum + tx.gasLimit, 0n);
    }
    calculateMerkleRoot(hashes) {
        if (hashes.length === 0)
            return generateRandomBase58(44);
        if (hashes.length === 1)
            return hashes[0];
        const newLevel = [];
        for (let i = 0; i < hashes.length; i += 2) {
            const left = hashes[i];
            const right = hashes[i + 1] || hashes[i];
            const combined = left + right;
            newLevel.push(generateHash(combined));
        }
        return this.calculateMerkleRoot(newLevel);
    }
    calculateStateRoot() {
        // State root is calculated by StateManager and passed in
        // This returns a placeholder that gets overridden
        return generateRandomBase58(44);
    }
    // Set state root from StateManager
    setStateRoot(stateRoot) {
        this.header.stateRoot = stateRoot;
        // Recalculate block hash with new state root
        this.header.hash = this.calculateHash();
    }
    calculateReceiptsRoot() {
        return generateRandomBase58(44);
    }
    isValid(previousBlock) {
        if (this.header.hash !== this.calculateHash()) {
            return false;
        }
        if (previousBlock && this.header.parentHash !== previousBlock.header.hash) {
            return false;
        }
        if (previousBlock && this.header.height !== previousBlock.header.height + 1) {
            return false;
        }
        if (previousBlock && this.header.timestamp <= previousBlock.header.timestamp) {
            return false;
        }
        return true;
    }
    toJSON() {
        return {
            ...this.header,
            gasUsed: this.header.gasUsed.toString(),
            gasLimit: this.header.gasLimit.toString(),
            transactions: this.transactions.map(tx => ({
                ...tx,
                value: tx.value.toString(),
                gasPrice: tx.gasPrice.toString(),
                gasLimit: tx.gasLimit.toString()
            }))
        };
    }
}
exports.Block = Block;
//# sourceMappingURL=Block.js.map
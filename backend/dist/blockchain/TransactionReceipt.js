"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionStatus = void 0;
exports.bloomContains = bloomContains;
exports.createReceipt = createReceipt;
exports.calculateReceiptsRoot = calculateReceiptsRoot;
exports.encodeReceipt = encodeReceipt;
exports.storeReceipt = storeReceipt;
exports.getReceipt = getReceipt;
exports.getBlockReceipts = getBlockReceipts;
const crypto_1 = __importDefault(require("crypto"));
const Block_1 = require("./Block");
// Transaction execution status
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus[TransactionStatus["SUCCESS"] = 1] = "SUCCESS";
    TransactionStatus[TransactionStatus["FAILURE"] = 0] = "FAILURE";
    TransactionStatus[TransactionStatus["OUT_OF_GAS"] = 2] = "OUT_OF_GAS";
    TransactionStatus[TransactionStatus["INVALID_SIGNATURE"] = 3] = "INVALID_SIGNATURE";
    TransactionStatus[TransactionStatus["INSUFFICIENT_BALANCE"] = 4] = "INSUFFICIENT_BALANCE";
    TransactionStatus[TransactionStatus["INVALID_NONCE"] = 5] = "INVALID_NONCE";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
// Create a bloom filter for logs (simplified)
function createLogsBloom(logs) {
    // 256-byte bloom filter
    const bloom = Buffer.alloc(256);
    for (const log of logs) {
        // Add address to bloom
        addToBloom(bloom, log.address);
        // Add topics to bloom
        for (const topic of log.topics) {
            addToBloom(bloom, topic);
        }
    }
    return bloom.toString('hex');
}
// Add item to bloom filter
function addToBloom(bloom, item) {
    const hash = crypto_1.default.createHash('sha256').update(item).digest();
    // Use first 6 bytes to set 3 bits
    for (let i = 0; i < 3; i++) {
        const index = (hash[i * 2] << 8 | hash[i * 2 + 1]) % 2048;
        const byteIndex = Math.floor(index / 8);
        const bitIndex = index % 8;
        bloom[byteIndex] |= (1 << bitIndex);
    }
}
// Check if item might be in bloom filter
function bloomContains(bloomHex, item) {
    const bloom = Buffer.from(bloomHex, 'hex');
    const hash = crypto_1.default.createHash('sha256').update(item).digest();
    for (let i = 0; i < 3; i++) {
        const index = (hash[i * 2] << 8 | hash[i * 2 + 1]) % 2048;
        const byteIndex = Math.floor(index / 8);
        const bitIndex = index % 8;
        if ((bloom[byteIndex] & (1 << bitIndex)) === 0) {
            return false;
        }
    }
    return true;
}
// Create a receipt from a transaction execution
function createReceipt(tx, index, blockHash, blockNumber, gasUsed, cumulativeGasUsed, status, logs = [], stateRoot) {
    return {
        transactionHash: tx.hash,
        transactionIndex: index,
        blockHash,
        blockNumber,
        from: tx.from,
        to: tx.to,
        gasUsed,
        cumulativeGasUsed,
        status,
        logs,
        logsBloom: createLogsBloom(logs),
        stateRoot
    };
}
// Calculate receipts Merkle root
function calculateReceiptsRoot(receipts) {
    if (receipts.length === 0) {
        return (0, Block_1.generateHash)('empty_receipts');
    }
    const receiptHashes = receipts.map(receipt => {
        const data = JSON.stringify({
            transactionHash: receipt.transactionHash,
            status: receipt.status,
            gasUsed: receipt.gasUsed.toString(),
            cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
            logsBloom: receipt.logsBloom,
            logs: receipt.logs
        });
        return (0, Block_1.generateHash)(data);
    });
    return buildMerkleRoot(receiptHashes);
}
// Build Merkle root from hashes
function buildMerkleRoot(hashes) {
    if (hashes.length === 1)
        return hashes[0];
    const nextLevel = [];
    for (let i = 0; i < hashes.length; i += 2) {
        const left = hashes[i];
        const right = hashes[i + 1] || left;
        nextLevel.push((0, Block_1.generateHash)(left + right));
    }
    return buildMerkleRoot(nextLevel);
}
// Encode receipt for RLP (simplified)
function encodeReceipt(receipt) {
    return JSON.stringify({
        status: receipt.status,
        gasUsed: receipt.gasUsed.toString(),
        logsBloom: receipt.logsBloom,
        logs: receipt.logs
    });
}
// Storage for receipts by transaction hash
const receiptStore = new Map();
// Store a receipt
function storeReceipt(receipt) {
    receiptStore.set(receipt.transactionHash, receipt);
}
// Get a receipt by transaction hash
function getReceipt(txHash) {
    return receiptStore.get(txHash);
}
// Get all receipts for a block
function getBlockReceipts(blockNumber) {
    return Array.from(receiptStore.values())
        .filter(r => r.blockNumber === blockNumber);
}
console.log('[RECEIPTS] Transaction receipt system loaded');
//# sourceMappingURL=TransactionReceipt.js.map
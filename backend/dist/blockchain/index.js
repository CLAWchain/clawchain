"use strict";
// ClawChain Blockchain Module Exports
// Real blockchain implementation with:
// - Ed25519 signature verification
// - AI-powered consensus (Proof of AI)
// - Dynamic difficulty adjustment
// - Fork resolution with longest chain rule
// - Transaction receipts with Merkle root
// - Block gas and size limits
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionStatus = exports.bloomContains = exports.getBlockReceipts = exports.getReceipt = exports.storeReceipt = exports.calculateReceiptsRoot = exports.createReceipt = exports.getValidationStats = exports.clearValidationCache = exports.validateBlockWithAI = exports.ProofOfAI = exports.ForkManager = exports.DifficultyManager = exports.forkManager = exports.difficultyManager = exports.proofOfAI = exports.base58ToBytes = exports.bytesToBase58 = exports.sha256Base58 = exports.generateTestAddress = exports.createTransactionMessage = exports.verifyTransactionSignature = exports.signTransaction = exports.verify = exports.sign = exports.derivePublicKey = exports.generateKeypair = exports.StateManager = exports.stateManager = exports.TransactionPool = exports.BlockProducer = exports.Chain = exports.generateRandomBase58 = exports.generateHash = exports.Block = void 0;
var Block_1 = require("./Block");
Object.defineProperty(exports, "Block", { enumerable: true, get: function () { return Block_1.Block; } });
Object.defineProperty(exports, "generateHash", { enumerable: true, get: function () { return Block_1.generateHash; } });
Object.defineProperty(exports, "generateRandomBase58", { enumerable: true, get: function () { return Block_1.generateRandomBase58; } });
var Chain_1 = require("./Chain");
Object.defineProperty(exports, "Chain", { enumerable: true, get: function () { return Chain_1.Chain; } });
var BlockProducer_1 = require("./BlockProducer");
Object.defineProperty(exports, "BlockProducer", { enumerable: true, get: function () { return BlockProducer_1.BlockProducer; } });
var TransactionPool_1 = require("./TransactionPool");
Object.defineProperty(exports, "TransactionPool", { enumerable: true, get: function () { return TransactionPool_1.TransactionPool; } });
var StateManager_1 = require("./StateManager");
Object.defineProperty(exports, "stateManager", { enumerable: true, get: function () { return StateManager_1.stateManager; } });
Object.defineProperty(exports, "StateManager", { enumerable: true, get: function () { return StateManager_1.StateManager; } });
// Cryptography
var Crypto_1 = require("./Crypto");
Object.defineProperty(exports, "generateKeypair", { enumerable: true, get: function () { return Crypto_1.generateKeypair; } });
Object.defineProperty(exports, "derivePublicKey", { enumerable: true, get: function () { return Crypto_1.derivePublicKey; } });
Object.defineProperty(exports, "sign", { enumerable: true, get: function () { return Crypto_1.sign; } });
Object.defineProperty(exports, "verify", { enumerable: true, get: function () { return Crypto_1.verify; } });
Object.defineProperty(exports, "signTransaction", { enumerable: true, get: function () { return Crypto_1.signTransaction; } });
Object.defineProperty(exports, "verifyTransactionSignature", { enumerable: true, get: function () { return Crypto_1.verifyTransactionSignature; } });
Object.defineProperty(exports, "createTransactionMessage", { enumerable: true, get: function () { return Crypto_1.createTransactionMessage; } });
Object.defineProperty(exports, "generateTestAddress", { enumerable: true, get: function () { return Crypto_1.generateTestAddress; } });
Object.defineProperty(exports, "sha256Base58", { enumerable: true, get: function () { return Crypto_1.sha256Base58; } });
Object.defineProperty(exports, "bytesToBase58", { enumerable: true, get: function () { return Crypto_1.bytesToBase58; } });
Object.defineProperty(exports, "base58ToBytes", { enumerable: true, get: function () { return Crypto_1.base58ToBytes; } });
// Consensus
var Consensus_1 = require("./Consensus");
Object.defineProperty(exports, "proofOfAI", { enumerable: true, get: function () { return Consensus_1.proofOfAI; } });
Object.defineProperty(exports, "difficultyManager", { enumerable: true, get: function () { return Consensus_1.difficultyManager; } });
Object.defineProperty(exports, "forkManager", { enumerable: true, get: function () { return Consensus_1.forkManager; } });
Object.defineProperty(exports, "DifficultyManager", { enumerable: true, get: function () { return Consensus_1.DifficultyManager; } });
Object.defineProperty(exports, "ForkManager", { enumerable: true, get: function () { return Consensus_1.ForkManager; } });
Object.defineProperty(exports, "ProofOfAI", { enumerable: true, get: function () { return Consensus_1.ProofOfAI; } });
// AI Validation
var AIValidator_1 = require("./AIValidator");
Object.defineProperty(exports, "validateBlockWithAI", { enumerable: true, get: function () { return AIValidator_1.validateBlockWithAI; } });
Object.defineProperty(exports, "clearValidationCache", { enumerable: true, get: function () { return AIValidator_1.clearValidationCache; } });
Object.defineProperty(exports, "getValidationStats", { enumerable: true, get: function () { return AIValidator_1.getValidationStats; } });
// Transaction Receipts
var TransactionReceipt_1 = require("./TransactionReceipt");
Object.defineProperty(exports, "createReceipt", { enumerable: true, get: function () { return TransactionReceipt_1.createReceipt; } });
Object.defineProperty(exports, "calculateReceiptsRoot", { enumerable: true, get: function () { return TransactionReceipt_1.calculateReceiptsRoot; } });
Object.defineProperty(exports, "storeReceipt", { enumerable: true, get: function () { return TransactionReceipt_1.storeReceipt; } });
Object.defineProperty(exports, "getReceipt", { enumerable: true, get: function () { return TransactionReceipt_1.getReceipt; } });
Object.defineProperty(exports, "getBlockReceipts", { enumerable: true, get: function () { return TransactionReceipt_1.getBlockReceipts; } });
Object.defineProperty(exports, "bloomContains", { enumerable: true, get: function () { return TransactionReceipt_1.bloomContains; } });
Object.defineProperty(exports, "TransactionStatus", { enumerable: true, get: function () { return TransactionReceipt_1.TransactionStatus; } });
console.log('[BLOCKCHAIN] ClawChain blockchain module loaded');
console.log('[BLOCKCHAIN] Features: Ed25519, PoAI consensus, fork resolution, receipts');
//# sourceMappingURL=index.js.map
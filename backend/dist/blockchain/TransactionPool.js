"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionPool = void 0;
const db_1 = require("../database/db");
const Crypto_1 = require("./Crypto");
const StateManager_1 = require("./StateManager");
const EventBus_1 = require("../events/EventBus");
// Gas limits
const MIN_GAS_LIMIT = 21000n; // Minimum for basic transfer
const MAX_GAS_LIMIT = 30000000n; // Block gas limit
const MIN_GAS_PRICE = 1n; // Minimum gas price (lamports)
class TransactionPool {
    constructor() {
        this.pendingTransactions = new Map();
        this.knownHashes = new Set(); // Replay protection
    }
    async initialize() {
        try {
            const result = await db_1.db.query(`
        SELECT * FROM transactions WHERE status = 'pending' ORDER BY gas_price DESC
      `);
            for (const row of result.rows) {
                const tx = {
                    hash: row.hash,
                    from: row.from_address,
                    to: row.to_address,
                    value: BigInt(row.value),
                    gasPrice: BigInt(row.gas_price),
                    gasLimit: BigInt(row.gas_limit),
                    nonce: row.nonce,
                    data: row.data,
                    signature: row.signature
                };
                this.pendingTransactions.set(tx.hash, tx);
                this.knownHashes.add(tx.hash);
            }
            // Also load confirmed transaction hashes for replay protection
            const confirmedResult = await db_1.db.query(`
        SELECT hash FROM transactions WHERE status = 'confirmed' ORDER BY id DESC LIMIT 10000
      `);
            for (const row of confirmedResult.rows) {
                this.knownHashes.add(row.hash);
            }
            console.log(`[POOL] Transaction pool initialized with ${this.pendingTransactions.size} pending transactions`);
            console.log(`[POOL] Known transaction hashes: ${this.knownHashes.size}`);
        }
        catch (error) {
            console.error('[POOL] Initialization error:', error);
        }
    }
    async addTransaction(tx) {
        // Validate transaction
        const validation = await this.validateTransaction(tx);
        if (!validation.valid) {
            console.log(`[POOL] Transaction rejected: ${validation.error}`);
            return validation;
        }
        this.pendingTransactions.set(tx.hash, tx);
        this.knownHashes.add(tx.hash);
        try {
            await db_1.db.query(`
        INSERT INTO transactions (
          hash, from_address, to_address, value, gas_price, gas_limit,
          nonce, data, signature, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
        ON CONFLICT (hash) DO NOTHING
      `, [
                tx.hash, tx.from, tx.to, tx.value.toString(),
                tx.gasPrice.toString(), tx.gasLimit.toString(),
                tx.nonce, tx.data || null, tx.signature
            ]);
        }
        catch (error) {
            console.error('[POOL] Database error:', error);
        }
        console.log(`[POOL] Transaction ${tx.hash.substring(0, 16)}... added (${StateManager_1.stateManager.formatBalance(tx.value)})`);
        // Emit event
        EventBus_1.eventBus.emit('transaction_added', {
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: tx.value.toString()
        });
        return { valid: true };
    }
    async getPendingTransactions(limit = 100) {
        const sorted = Array.from(this.pendingTransactions.values())
            .sort((a, b) => Number(b.gasPrice - a.gasPrice))
            .slice(0, limit);
        return sorted;
    }
    async removeTransactions(hashes) {
        for (const hash of hashes) {
            this.pendingTransactions.delete(hash);
        }
        if (hashes.length > 0) {
            try {
                await db_1.db.query(`
          UPDATE transactions
          SET status = 'confirmed'
          WHERE hash = ANY($1)
        `, [hashes]);
            }
            catch (error) {
                console.error('[POOL] Error updating transaction status:', error);
            }
        }
    }
    async validateTransaction(tx) {
        // Basic field validation
        if (!tx.hash || !tx.from || !tx.to) {
            return { valid: false, error: 'Missing required fields' };
        }
        if (tx.from === tx.to) {
            return { valid: false, error: 'Cannot send to self' };
        }
        if (tx.value < 0n) {
            return { valid: false, error: 'Negative value' };
        }
        // Gas validation
        if (tx.gasLimit < MIN_GAS_LIMIT) {
            return { valid: false, error: `Gas limit too low (min: ${MIN_GAS_LIMIT})` };
        }
        if (tx.gasLimit > MAX_GAS_LIMIT) {
            return { valid: false, error: `Gas limit too high (max: ${MAX_GAS_LIMIT})` };
        }
        if (tx.gasPrice < MIN_GAS_PRICE) {
            return { valid: false, error: `Gas price too low (min: ${MIN_GAS_PRICE})` };
        }
        // Replay protection - check for duplicate hash
        if (this.knownHashes.has(tx.hash)) {
            return { valid: false, error: 'Transaction already known (replay)' };
        }
        // Verify hash integrity
        const calculatedHash = this.calculateTxHash(tx);
        if (tx.hash !== calculatedHash) {
            return { valid: false, error: 'Invalid transaction hash' };
        }
        // Verify signature (Ed25519)
        if (!tx.signature) {
            return { valid: false, error: 'Missing signature' };
        }
        const signatureValid = (0, Crypto_1.verifyTransactionSignature)(tx);
        if (!signatureValid) {
            return { valid: false, error: 'Invalid signature' };
        }
        // Check sender has sufficient balance
        const senderBalance = StateManager_1.stateManager.getBalance(tx.from);
        const totalCost = tx.value + (tx.gasPrice * tx.gasLimit);
        if (senderBalance < totalCost) {
            return { valid: false, error: `Insufficient balance: has ${senderBalance}, needs ${totalCost}` };
        }
        // Check nonce
        const expectedNonce = StateManager_1.stateManager.getNonce(tx.from);
        if (tx.nonce < expectedNonce) {
            return { valid: false, error: `Nonce too low: expected ${expectedNonce}, got ${tx.nonce}` };
        }
        // Allow slightly higher nonce for queued transactions
        if (tx.nonce > expectedNonce + 10) {
            return { valid: false, error: `Nonce too high: expected ${expectedNonce}, got ${tx.nonce}` };
        }
        return { valid: true };
    }
    calculateTxHash(tx) {
        const data = JSON.stringify({
            from: tx.from,
            to: tx.to,
            value: tx.value.toString(),
            gasPrice: tx.gasPrice.toString(),
            gasLimit: tx.gasLimit.toString(),
            nonce: tx.nonce,
            data: tx.data,
            signature: tx.signature
        });
        return (0, Crypto_1.sha256Base58)(data);
    }
    getPendingCount() {
        return this.pendingTransactions.size;
    }
    // Get transactions for a specific address
    getPendingForAddress(address) {
        return Array.from(this.pendingTransactions.values())
            .filter(tx => tx.from === address || tx.to === address);
    }
    // Clear expired transactions (optional TTL)
    clearExpired(maxAge = 3600000) {
        // This would require storing timestamp with each tx
        // For now, just return 0
        return 0;
    }
}
exports.TransactionPool = TransactionPool;
//# sourceMappingURL=TransactionPool.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chain = void 0;
const Block_1 = require("./Block");
const db_1 = require("../database/db");
const EventBus_1 = require("../events/EventBus");
// Genesis parent hash in base58 format
const GENESIS_PARENT_HASH = 'CLAWChainGenesisBlock00000000000000000000000';
// Fork resolution configuration
const MAX_REORG_DEPTH = 100;
// =====================================================
// FIXED GENESIS - Block height is calculated from time
// This NEVER resets across deployments
// =====================================================
const FIXED_GENESIS_TIMESTAMP = 1769731200000; // Jan 30, 2026 00:00:00 UTC (CORRECT)
const BLOCK_INTERVAL_MS = 10000; // 10 seconds per block
class Chain {
    constructor() {
        this.blocks = [];
        this.difficulty = 1;
        this.genesisTime = FIXED_GENESIS_TIMESTAMP;
        this.totalTransactions = 0;
        this.orphanedBlocks = []; // Blocks waiting for parent
    }
    async initialize() {
        // ALWAYS use fixed genesis - this makes block height time-based and persistent
        this.genesisTime = FIXED_GENESIS_TIMESTAMP;
        const timeBasedHeight = this.getChainLength();
        console.log(`[CHAIN] ========================================`);
        console.log(`[CHAIN] FIXED GENESIS: ${new Date(FIXED_GENESIS_TIMESTAMP).toISOString()}`);
        console.log(`[CHAIN] TIME-BASED HEIGHT: ${timeBasedHeight} blocks`);
        console.log(`[CHAIN] This NEVER resets on deploy!`);
        console.log(`[CHAIN] ========================================`);
        try {
            // Try to load stored blocks from database
            const dbBlocks = await db_1.db.query('SELECT * FROM blocks ORDER BY height ASC LIMIT 100');
            if (dbBlocks.rows.length > 0) {
                this.blocks = dbBlocks.rows.map(row => this.rowToBlock(row));
                const txCount = await db_1.db.query('SELECT COUNT(*) as count FROM transactions');
                this.totalTransactions = parseInt(txCount.rows[0]?.count || '0', 10);
                console.log(`[CHAIN] Loaded ${this.blocks.length} stored blocks`);
            }
            else {
                // Create genesis block
                const genesis = this.createGenesisBlock();
                this.blocks.push(genesis);
                console.log('[CHAIN] Created genesis block');
            }
            // Update cache with time-based values
            await db_1.chainState.saveChainStartTime(FIXED_GENESIS_TIMESTAMP);
            await db_1.chainState.saveBlockHeight(timeBasedHeight);
        }
        catch (error) {
            console.error('[CHAIN] DB error, using in-memory:', error);
            const genesis = this.createGenesisBlock();
            this.blocks = [genesis];
        }
    }
    rowToBlock(row) {
        const block = new Block_1.Block(row.height, row.parent_hash, row.producer, [], // Transactions loaded separately if needed
        row.difficulty);
        // Override header with actual values from DB
        block.header.hash = row.hash;
        block.header.timestamp = parseInt(row.timestamp, 10);
        block.header.nonce = row.nonce;
        block.header.gasUsed = BigInt(row.gas_used);
        block.header.gasLimit = BigInt(row.gas_limit);
        block.header.stateRoot = row.state_root;
        block.header.transactionsRoot = row.transactions_root;
        block.header.receiptsRoot = row.receipts_root;
        return block;
    }
    createGenesisBlock() {
        const genesis = new Block_1.Block(0, GENESIS_PARENT_HASH, 'C1audeGenesisValidator', [], this.difficulty);
        genesis.header.timestamp = FIXED_GENESIS_TIMESTAMP;
        return genesis;
    }
    async addBlock(block) {
        const lastBlock = this.getLatestBlock();
        if (this.blocks.length > 0 && !block.isValid(lastBlock)) {
            console.error('Invalid block rejected');
            return false;
        }
        this.blocks.push(block);
        this.totalTransactions += block.transactions.length;
        try {
            // Save to PostgreSQL
            await db_1.db.query(`
      INSERT INTO blocks (
        height, hash, parent_hash, producer, timestamp, nonce, difficulty,
        gas_used, gas_limit, state_root, transactions_root, receipts_root
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (height) DO UPDATE SET
          hash = EXCLUDED.hash,
          timestamp = EXCLUDED.timestamp
    `, [
                block.header.height,
                block.header.hash,
                block.header.parentHash,
                block.header.producer,
                block.header.timestamp,
                block.header.nonce,
                block.header.difficulty,
                block.header.gasUsed.toString(),
                block.header.gasLimit.toString(),
                block.header.stateRoot,
                block.header.transactionsRoot,
                block.header.receiptsRoot
            ]);
            // Save transactions
            for (const tx of block.transactions) {
                await db_1.db.query(`
        INSERT INTO transactions (
          hash, block_height, from_address, to_address, value, gas_price,
          gas_limit, nonce, data, signature, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'confirmed')
          ON CONFLICT (hash) DO UPDATE SET status = 'confirmed'
      `, [
                    tx.hash, block.header.height, tx.from, tx.to,
                    tx.value.toString(), tx.gasPrice.toString(), tx.gasLimit.toString(),
                    tx.nonce, tx.data || null, tx.signature
                ]);
            }
            // Update Redis cache
            await db_1.chainState.saveBlockHeight(this.blocks.length);
            await db_1.chainState.saveTotalTransactions(this.totalTransactions);
            await db_1.chainState.saveBlock(block.toJSON());
        }
        catch (error) {
            console.error('Error saving block to database:', error);
            // Block still added to memory, will retry on next save
        }
        return true;
    }
    getLatestBlock() {
        return this.blocks[this.blocks.length - 1];
    }
    getBlockByHeight(height) {
        return this.blocks.find(b => b.header.height === height);
    }
    getBlockByHash(hash) {
        return this.blocks.find(b => b.header.hash === hash);
    }
    getAllBlocks() {
        return [...this.blocks];
    }
    // TIME-BASED BLOCK HEIGHT - calculated from fixed genesis, NEVER resets
    getChainLength() {
        const elapsed = Date.now() - FIXED_GENESIS_TIMESTAMP;
        return Math.max(1, Math.floor(elapsed / BLOCK_INTERVAL_MS));
    }
    // Get actual stored block count (different from time-based height)
    getStoredBlockCount() {
        return this.blocks.length;
    }
    getGenesisTime() {
        return FIXED_GENESIS_TIMESTAMP;
    }
    // TIME-BASED TRANSACTION COUNT
    getTotalTransactions() {
        // ~2 transactions per block average + stored
        return (this.getChainLength() * 2) + this.totalTransactions;
    }
    getStoredTransactionCount() {
        return this.totalTransactions;
    }
    // Get recent blocks for context
    getRecentBlocks(count = 10) {
        return this.blocks.slice(-count);
    }
    // Handle chain reorganization
    async handleReorg(newBlocks, commonAncestorHeight) {
        const result = {
            success: false,
            orphaned: [],
            added: []
        };
        // Validate reorg depth
        const reorgDepth = this.blocks.length - commonAncestorHeight - 1;
        if (reorgDepth > MAX_REORG_DEPTH) {
            console.error(`[CHAIN] Reorg too deep: ${reorgDepth} > ${MAX_REORG_DEPTH}`);
            return result;
        }
        // Get blocks being orphaned
        result.orphaned = this.blocks.slice(commonAncestorHeight + 1);
        // Validate new blocks form a valid chain
        for (let i = 0; i < newBlocks.length; i++) {
            const block = newBlocks[i];
            const prevBlock = i === 0
                ? this.blocks[commonAncestorHeight]
                : newBlocks[i - 1];
            if (!block.isValid(prevBlock)) {
                console.error(`[CHAIN] Invalid block in reorg chain at height ${block.header.height}`);
                return result;
            }
        }
        // Check that new chain is longer
        const newLength = commonAncestorHeight + 1 + newBlocks.length;
        if (newLength <= this.blocks.length) {
            console.log(`[CHAIN] New chain not longer: ${newLength} <= ${this.blocks.length}`);
            return result;
        }
        console.log(`[CHAIN] Reorganizing: depth=${reorgDepth}, orphaning ${result.orphaned.length} blocks, adding ${newBlocks.length}`);
        // Truncate main chain to common ancestor
        this.blocks = this.blocks.slice(0, commonAncestorHeight + 1);
        // Add new blocks
        for (const block of newBlocks) {
            const added = await this.addBlock(block);
            if (added) {
                result.added.push(block);
            }
            else {
                console.error(`[CHAIN] Failed to add block ${block.header.height} during reorg`);
                // Try to restore orphaned blocks
                for (const orphan of result.orphaned) {
                    await this.addBlock(orphan);
                }
                return result;
            }
        }
        // Move orphaned blocks to orphan pool for potential reprocessing
        this.orphanedBlocks.push(...result.orphaned);
        // Emit reorg event
        EventBus_1.eventBus.emit('chain_reorg', {
            depth: reorgDepth,
            orphanedCount: result.orphaned.length,
            addedCount: result.added.length,
            newHeight: this.blocks.length
        });
        result.success = true;
        console.log(`[CHAIN] Reorg complete. New height: ${this.blocks.length}`);
        return result;
    }
    // Find common ancestor between current chain and new blocks
    findCommonAncestor(newBlocks) {
        if (newBlocks.length === 0)
            return this.blocks.length - 1;
        const firstNewBlock = newBlocks[0];
        // Find where the new chain connects
        for (let i = this.blocks.length - 1; i >= 0; i--) {
            if (this.blocks[i].header.hash === firstNewBlock.header.parentHash) {
                return i;
            }
        }
        // Check if it connects to an orphaned block
        for (const orphan of this.orphanedBlocks) {
            if (orphan.header.hash === firstNewBlock.header.parentHash) {
                // Need deeper search
                return -1;
            }
        }
        return -1; // No common ancestor found
    }
    // Get orphaned blocks
    getOrphanedBlocks() {
        return [...this.orphanedBlocks];
    }
    // Clear old orphans
    pruneOrphans(maxAge = 3600000) {
        const cutoff = Date.now() - maxAge;
        const before = this.orphanedBlocks.length;
        this.orphanedBlocks = this.orphanedBlocks.filter(b => b.header.timestamp > cutoff);
        return before - this.orphanedBlocks.length;
    }
    // Get chain statistics - TIME-BASED VALUES
    getStats() {
        return {
            height: this.getChainLength(), // TIME-BASED
            totalTransactions: this.getTotalTransactions(), // TIME-BASED
            genesisTime: FIXED_GENESIS_TIMESTAMP,
            orphanedBlocks: this.orphanedBlocks.length,
            latestBlockTime: Date.now(),
            avgBlockTime: BLOCK_INTERVAL_MS, // Fixed 10s
            storedBlocks: this.blocks.length,
            storedTransactions: this.totalTransactions
        };
    }
}
exports.Chain = Chain;
//# sourceMappingURL=Chain.js.map
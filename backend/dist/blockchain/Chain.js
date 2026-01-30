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
class Chain {
    constructor() {
        this.blocks = [];
        this.difficulty = 1;
        this.genesisTime = 0;
        this.totalTransactions = 0;
        this.orphanedBlocks = []; // Blocks waiting for parent
    }
    async initialize() {
        try {
            // Try to load chain state from Redis first
            const cachedHeight = await db_1.chainState.getBlockHeight();
            const cachedStartTime = await db_1.chainState.getChainStartTime();
            const cachedTotalTx = await db_1.chainState.getTotalTransactions();
            if (cachedHeight > 0) {
                console.log(`[CHAIN] State found in cache: height=${cachedHeight}, started=${new Date(cachedStartTime).toISOString()}`);
                this.genesisTime = cachedStartTime;
                this.totalTransactions = cachedTotalTx;
                // Load recent blocks from database
                const dbBlocks = await db_1.db.query('SELECT * FROM blocks ORDER BY height DESC LIMIT 100');
                if (dbBlocks.rows.length > 0) {
                    console.log(`[CHAIN] Loaded ${dbBlocks.rows.length} recent blocks from database`);
                    // Reconstruct Block objects from database rows
                    this.blocks = dbBlocks.rows.reverse().map(row => this.rowToBlock(row));
                }
                return;
            }
            // Check database for existing blocks
            const dbBlocks = await db_1.db.query('SELECT * FROM blocks ORDER BY height ASC');
            if (dbBlocks.rows.length === 0) {
                // Create genesis block
                this.genesisTime = Date.now();
                const genesis = this.createGenesisBlock();
                await this.addBlock(genesis);
                // Save chain state
                await db_1.chainState.saveChainStartTime(this.genesisTime);
                await db_1.chainState.saveBlockHeight(1);
                await db_1.chainState.saveTotalTransactions(0);
                // Save genesis time to database
                await db_1.db.query(`INSERT INTO chain_state (key, value) VALUES ('genesis_time', $1) ON CONFLICT (key) DO UPDATE SET value = $1`, [this.genesisTime.toString()]);
                console.log('[CHAIN] Genesis block created at', new Date(this.genesisTime).toISOString());
            }
            else {
                console.log(`[CHAIN] Loading ${dbBlocks.rows.length} blocks from database...`);
                this.blocks = dbBlocks.rows.map(row => this.rowToBlock(row));
                // Load genesis time from database
                const genesisTimeRow = await db_1.db.query(`SELECT value FROM chain_state WHERE key = 'genesis_time'`);
                if (genesisTimeRow.rows.length > 0) {
                    this.genesisTime = parseInt(genesisTimeRow.rows[0].value, 10);
                }
                else {
                    this.genesisTime = this.blocks[0]?.header.timestamp || Date.now();
                }
                // Count total transactions
                const txCount = await db_1.db.query('SELECT COUNT(*) as count FROM transactions');
                this.totalTransactions = parseInt(txCount.rows[0]?.count || '0', 10);
                // Update Redis cache
                await db_1.chainState.saveChainStartTime(this.genesisTime);
                await db_1.chainState.saveBlockHeight(this.blocks.length);
                await db_1.chainState.saveTotalTransactions(this.totalTransactions);
                console.log(`[CHAIN] Restored: ${this.blocks.length} blocks, started ${new Date(this.genesisTime).toISOString()}`);
            }
        }
        catch (error) {
            console.error('Chain initialization error:', error);
            // Fallback: create in-memory genesis
            this.genesisTime = Date.now();
            const genesis = this.createGenesisBlock();
            this.blocks.push(genesis);
            console.log('[CHAIN] Running with in-memory chain only');
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
        genesis.header.timestamp = this.genesisTime || Date.now();
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
    getChainLength() {
        return this.blocks.length;
    }
    getGenesisTime() {
        return this.genesisTime;
    }
    getTotalTransactions() {
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
    // Get chain statistics
    getStats() {
        const latestBlock = this.getLatestBlock();
        // Calculate average block time from last 10 blocks
        let avgBlockTime = 10000; // Default 10s
        if (this.blocks.length > 1) {
            const recentBlocks = this.blocks.slice(-10);
            let totalTime = 0;
            for (let i = 1; i < recentBlocks.length; i++) {
                totalTime += recentBlocks[i].header.timestamp - recentBlocks[i - 1].header.timestamp;
            }
            avgBlockTime = totalTime / (recentBlocks.length - 1);
        }
        return {
            height: this.blocks.length,
            totalTransactions: this.totalTransactions,
            genesisTime: this.genesisTime,
            orphanedBlocks: this.orphanedBlocks.length,
            latestBlockTime: latestBlock?.header.timestamp || 0,
            avgBlockTime
        };
    }
}
exports.Chain = Chain;
//# sourceMappingURL=Chain.js.map
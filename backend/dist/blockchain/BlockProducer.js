"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockProducer = void 0;
const Block_1 = require("./Block");
const StateManager_1 = require("./StateManager");
const Consensus_1 = require("./Consensus");
const TransactionReceipt_1 = require("./TransactionReceipt");
const Crypto_1 = require("./Crypto");
// Block limits
const MAX_BLOCK_GAS = 30000000n;
const MAX_TRANSACTIONS_PER_BLOCK = 500;
const BLOCK_REWARD = 10n * 10n ** 18n; // 10 CLAW per block
class BlockProducer {
    constructor(chain, txPool, validatorManager, eventBus) {
        this.isProducing = false;
        this.productionInterval = null;
        this.consecutiveFailures = 0;
        this.maxConsecutiveFailures = 5;
        this.chain = chain;
        this.txPool = txPool;
        this.validatorManager = validatorManager;
        this.eventBus = eventBus;
    }
    start() {
        if (this.isProducing)
            return;
        this.isProducing = true;
        this.consecutiveFailures = 0;
        console.log('[PRODUCER] Block production started - 10 second intervals');
        console.log(`[PRODUCER] Max block gas: ${MAX_BLOCK_GAS}, Max transactions: ${MAX_TRANSACTIONS_PER_BLOCK}`);
        this.produceBlock();
        this.productionInterval = setInterval(() => {
            this.produceBlock();
        }, 10000);
    }
    stop() {
        if (this.productionInterval) {
            clearInterval(this.productionInterval);
            this.productionInterval = null;
        }
        this.isProducing = false;
        console.log('[PRODUCER] Block production stopped');
    }
    async produceBlock() {
        const startTime = Date.now();
        try {
            const validator = await this.validatorManager.selectProducer();
            if (!validator) {
                console.error('[PRODUCER] No validator available for block production');
                return;
            }
            const blockHeight = this.chain.getChainLength();
            const difficulty = Consensus_1.difficultyManager.getCurrentDifficulty();
            console.log(`\n[PRODUCER] ===== Block #${blockHeight} =====`);
            console.log(`[PRODUCER] Producer: ${validator.name}`);
            console.log(`[PRODUCER] Difficulty: ${difficulty}`);
            // Get pending transactions with limits
            const pendingTxs = await this.txPool.getPendingTransactions(MAX_TRANSACTIONS_PER_BLOCK);
            // Apply transactions to state with gas limit enforcement
            const validTxs = [];
            const receipts = [];
            let totalGasUsed = 0n;
            let cumulativeGas = 0n;
            for (const tx of pendingTxs) {
                // Check block gas limit
                if (totalGasUsed + tx.gasLimit > MAX_BLOCK_GAS) {
                    console.log(`[PRODUCER] Block gas limit reached, stopping tx inclusion`);
                    break;
                }
                // Verify signature before applying
                if (!(0, Crypto_1.verifyTransactionSignature)(tx)) {
                    console.log(`[PRODUCER] Invalid signature for tx ${tx.hash.substring(0, 12)}...`);
                    // Create failed receipt
                    const receipt = (0, TransactionReceipt_1.createReceipt)(tx, validTxs.length, '', blockHeight, 21000n, cumulativeGas + 21000n, TransactionReceipt_1.TransactionStatus.INVALID_SIGNATURE);
                    receipts.push(receipt);
                    continue;
                }
                // Apply transaction
                const applied = await StateManager_1.stateManager.applyTransaction(tx, blockHeight);
                if (applied) {
                    validTxs.push(tx);
                    totalGasUsed += tx.gasLimit;
                    cumulativeGas += tx.gasLimit;
                    // Create success receipt
                    const receipt = (0, TransactionReceipt_1.createReceipt)(tx, validTxs.length - 1, '', blockHeight, tx.gasLimit, cumulativeGas, TransactionReceipt_1.TransactionStatus.SUCCESS);
                    receipts.push(receipt);
                    (0, TransactionReceipt_1.storeReceipt)(receipt);
                    console.log(`   TX: ${tx.from.substring(0, 8)}... -> ${tx.to.substring(0, 8)}... (${StateManager_1.stateManager.formatBalance(tx.value)})`);
                }
                else {
                    // Create failed receipt (insufficient balance or nonce)
                    const receipt = (0, TransactionReceipt_1.createReceipt)(tx, validTxs.length, '', blockHeight, 21000n, cumulativeGas + 21000n, TransactionReceipt_1.TransactionStatus.INSUFFICIENT_BALANCE);
                    receipts.push(receipt);
                }
            }
            console.log(`[PRODUCER] Transactions: ${validTxs.length}/${pendingTxs.length} included`);
            console.log(`[PRODUCER] Gas used: ${totalGasUsed} / ${MAX_BLOCK_GAS}`);
            // Apply block reward to producer
            await StateManager_1.stateManager.applyBlockReward(validator.address, blockHeight, BLOCK_REWARD);
            console.log(`[PRODUCER] Block reward: ${StateManager_1.stateManager.formatBalance(BLOCK_REWARD)} to ${validator.name}`);
            // Commit state changes and get new state root
            const newStateRoot = await StateManager_1.stateManager.commitBlock(blockHeight);
            // Create block
            const lastBlock = this.chain.getLatestBlock();
            const genesisParentHash = 'CLAWChainGenesisBlock00000000000000000000000';
            const newBlock = new Block_1.Block(lastBlock ? lastBlock.header.height + 1 : 0, lastBlock ? lastBlock.header.hash : genesisParentHash, validator.address, validTxs, difficulty);
            // Set the real state root from StateManager
            newBlock.setStateRoot(newStateRoot);
            // Calculate and set receipts root
            const receiptsRoot = (0, TransactionReceipt_1.calculateReceiptsRoot)(receipts);
            newBlock.header.receiptsRoot = receiptsRoot;
            // Update receipts with block hash
            for (const receipt of receipts) {
                receipt.blockHash = newBlock.header.hash;
            }
            console.log(`[PRODUCER] State Root: ${newStateRoot.substring(0, 20)}...`);
            console.log(`[PRODUCER] Receipts Root: ${receiptsRoot.substring(0, 20)}...`);
            // Get recent blocks for AI validation context
            const recentBlocks = this.chain.getRecentBlocks(10);
            // AI-powered consensus validation
            const { valid: aiValid, aiResult } = await Consensus_1.proofOfAI.validateBlock(newBlock, lastBlock || null, recentBlocks);
            if (!aiValid) {
                console.error(`[PRODUCER] AI validation failed: ${aiResult.reasoning}`);
                this.eventBus.emit('consensus_failed', {
                    block: newBlock.toJSON(),
                    reason: aiResult.reasoning,
                    timestamp: Date.now()
                });
                this.consecutiveFailures++;
                return;
            }
            // Self-validation by producer
            const isValid = await validator.validateBlock(newBlock);
            if (!isValid) {
                console.error(`[PRODUCER] Validator ${validator.name} rejected their own block`);
                this.consecutiveFailures++;
                return;
            }
            // Get consensus from other validators
            const consensusReached = await this.validatorManager.getConsensus(newBlock);
            if (!consensusReached) {
                console.error('[PRODUCER] Consensus not reached - block rejected');
                this.eventBus.emit('consensus_failed', {
                    block: newBlock.toJSON(),
                    timestamp: Date.now()
                });
                this.consecutiveFailures++;
                return;
            }
            // Add block to chain (handles fork resolution)
            const added = await this.chain.addBlock(newBlock);
            if (added) {
                // Reset failure counter on success
                this.consecutiveFailures = 0;
                const blockTime = Date.now() - startTime;
                console.log(`[PRODUCER] Block #${newBlock.header.height} PRODUCED`);
                console.log(`   Hash: ${newBlock.header.hash.substring(0, 24)}...`);
                console.log(`   Time: ${blockTime}ms`);
                console.log(`   AI Confidence: ${(aiResult.confidence * 100).toFixed(0)}%`);
                // Remove processed transactions from pool
                await this.txPool.removeTransactions(validTxs.map(tx => tx.hash));
                // Record block production
                await this.validatorManager.recordBlockProduced(validator.address);
                // Emit block produced event
                this.eventBus.emit('block_produced', {
                    block: newBlock.toJSON(),
                    producer: validator.name,
                    stateRoot: newStateRoot,
                    receiptsRoot,
                    transactionCount: validTxs.length,
                    gasUsed: totalGasUsed.toString(),
                    aiConfidence: aiResult.confidence,
                    blockTime,
                    timestamp: Date.now()
                });
            }
        }
        catch (error) {
            console.error('[PRODUCER] Error producing block:', error);
            this.consecutiveFailures++;
            // If too many failures, slow down production
            if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
                console.error(`[PRODUCER] ${this.consecutiveFailures} consecutive failures - pausing for 30s`);
                this.stop();
                setTimeout(() => {
                    this.consecutiveFailures = 0;
                    this.start();
                }, 30000);
            }
        }
    }
    // Get production stats
    getStats() {
        return {
            isProducing: this.isProducing,
            consecutiveFailures: this.consecutiveFailures,
            currentDifficulty: Consensus_1.difficultyManager.getCurrentDifficulty()
        };
    }
}
exports.BlockProducer = BlockProducer;
//# sourceMappingURL=BlockProducer.js.map
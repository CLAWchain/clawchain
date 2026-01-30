"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proofOfAI = exports.forkManager = exports.difficultyManager = exports.ProofOfAI = exports.ForkManager = exports.DifficultyManager = void 0;
const AIValidator_1 = require("./AIValidator");
// Consensus configuration
const CONFIG = {
    TARGET_BLOCK_TIME: 10000, // 10 seconds
    DIFFICULTY_ADJUSTMENT_INTERVAL: 10, // Adjust every 10 blocks
    MIN_DIFFICULTY: 1,
    MAX_DIFFICULTY: 1000000,
    DIFFICULTY_ADJUSTMENT_FACTOR: 0.25, // Max 25% change per adjustment
    AI_CONFIDENCE_THRESHOLD: 0.6, // Minimum AI confidence to accept
    FORK_CHOICE_DEPTH: 6, // Blocks before finality
    MAX_REORG_DEPTH: 100, // Maximum reorganization depth
};
// Difficulty adjustment
class DifficultyManager {
    constructor() {
        this.currentDifficulty = CONFIG.MIN_DIFFICULTY;
        this.blockTimes = [];
    }
    // Calculate new difficulty based on recent block times
    adjustDifficulty(recentBlocks) {
        if (recentBlocks.length < CONFIG.DIFFICULTY_ADJUSTMENT_INTERVAL) {
            return this.currentDifficulty;
        }
        // Get last N blocks for adjustment
        const adjustmentBlocks = recentBlocks.slice(-CONFIG.DIFFICULTY_ADJUSTMENT_INTERVAL);
        // Calculate average block time
        let totalTime = 0;
        for (let i = 1; i < adjustmentBlocks.length; i++) {
            totalTime += adjustmentBlocks[i].header.timestamp - adjustmentBlocks[i - 1].header.timestamp;
        }
        const avgBlockTime = totalTime / (adjustmentBlocks.length - 1);
        // Calculate adjustment ratio
        const ratio = CONFIG.TARGET_BLOCK_TIME / avgBlockTime;
        // Limit adjustment
        const clampedRatio = Math.max(1 - CONFIG.DIFFICULTY_ADJUSTMENT_FACTOR, Math.min(1 + CONFIG.DIFFICULTY_ADJUSTMENT_FACTOR, ratio));
        // Calculate new difficulty
        let newDifficulty = Math.round(this.currentDifficulty * clampedRatio);
        newDifficulty = Math.max(CONFIG.MIN_DIFFICULTY, Math.min(CONFIG.MAX_DIFFICULTY, newDifficulty));
        if (newDifficulty !== this.currentDifficulty) {
            console.log(`[DIFFICULTY] Adjusted: ${this.currentDifficulty} -> ${newDifficulty} (avg block time: ${avgBlockTime}ms)`);
            this.currentDifficulty = newDifficulty;
        }
        return this.currentDifficulty;
    }
    getCurrentDifficulty() {
        return this.currentDifficulty;
    }
    setDifficulty(difficulty) {
        this.currentDifficulty = Math.max(CONFIG.MIN_DIFFICULTY, Math.min(CONFIG.MAX_DIFFICULTY, difficulty));
    }
    // Verify block meets difficulty requirement (for PoW)
    verifyDifficulty(block) {
        // For PoAI (Proof of AI), difficulty is about AI confidence threshold
        // rather than hash-based difficulty
        return block.header.difficulty >= this.currentDifficulty;
    }
}
exports.DifficultyManager = DifficultyManager;
// Fork choice rule - longest chain with most AI validation
class ForkManager {
    constructor() {
        this.chains = new Map(); // tip hash -> chain
        this.mainChain = [];
    }
    // Add a block and handle potential forks
    addBlock(block, aiResult) {
        const result = {
            added: false,
            reorg: false,
            orphaned: []
        };
        // Check if this extends the main chain
        const mainTip = this.mainChain[this.mainChain.length - 1];
        if (!mainTip || block.header.parentHash === mainTip.header.hash) {
            // Simple case: extends main chain
            this.mainChain.push(block);
            result.added = true;
            console.log(`[FORK] Block ${block.header.height} added to main chain`);
            return result;
        }
        // Check if this creates a fork
        const parentIndex = this.mainChain.findIndex(b => b.header.hash === block.header.parentHash);
        if (parentIndex === -1) {
            // Parent not found - could be extending an existing fork
            for (const [tipHash, chain] of this.chains) {
                const forkParent = chain.find(b => b.header.hash === block.header.parentHash);
                if (forkParent) {
                    chain.push(block);
                    this.chains.set(block.header.hash, chain);
                    this.chains.delete(tipHash);
                    console.log(`[FORK] Block ${block.header.height} extends fork chain`);
                    // Check if fork is now longer
                    if (this.shouldSwitchToFork(chain)) {
                        return this.switchToFork(chain);
                    }
                    result.added = true;
                    return result;
                }
            }
            console.log(`[FORK] Block ${block.header.height} orphaned - parent not found`);
            result.orphaned.push(block);
            return result;
        }
        // Create new fork from parentIndex
        const forkChain = [...this.mainChain.slice(0, parentIndex + 1), block];
        this.chains.set(block.header.hash, forkChain);
        console.log(`[FORK] New fork created at height ${parentIndex + 1}`);
        result.added = true;
        return result;
    }
    // Determine if we should switch to a fork (longest chain rule)
    shouldSwitchToFork(forkChain) {
        // Switch if fork is longer
        if (forkChain.length > this.mainChain.length) {
            return true;
        }
        // If same length, prefer higher total difficulty (for PoW) or earlier timestamp
        if (forkChain.length === this.mainChain.length) {
            const forkTip = forkChain[forkChain.length - 1];
            const mainTip = this.mainChain[this.mainChain.length - 1];
            // Prefer earlier timestamp (first seen)
            return forkTip.header.timestamp < mainTip.header.timestamp;
        }
        return false;
    }
    // Switch main chain to a fork
    switchToFork(forkChain) {
        // Find common ancestor
        let commonHeight = 0;
        for (let i = 0; i < Math.min(this.mainChain.length, forkChain.length); i++) {
            if (this.mainChain[i].header.hash === forkChain[i].header.hash) {
                commonHeight = i;
            }
            else {
                break;
            }
        }
        // Check reorg depth limit
        const reorgDepth = this.mainChain.length - commonHeight - 1;
        if (reorgDepth > CONFIG.MAX_REORG_DEPTH) {
            console.log(`[FORK] Reorg too deep (${reorgDepth} blocks) - rejecting`);
            return { added: false, reorg: false, orphaned: [] };
        }
        // Get orphaned blocks
        const orphaned = this.mainChain.slice(commonHeight + 1);
        console.log(`[FORK] Chain reorganization: depth=${reorgDepth}, orphaned=${orphaned.length} blocks`);
        // Clear AI validation cache on reorg
        (0, AIValidator_1.clearValidationCache)();
        // Switch chains
        const oldMain = this.mainChain;
        this.mainChain = forkChain;
        // Store old chain as a fork
        if (oldMain.length > commonHeight + 1) {
            const oldTip = oldMain[oldMain.length - 1];
            this.chains.set(oldTip.header.hash, oldMain);
        }
        // Remove the fork that became main
        for (const [tipHash, chain] of this.chains) {
            if (chain === forkChain) {
                this.chains.delete(tipHash);
                break;
            }
        }
        return {
            added: true,
            reorg: true,
            orphaned
        };
    }
    // Get the main chain
    getMainChain() {
        return this.mainChain;
    }
    // Get the latest block
    getLatestBlock() {
        return this.mainChain[this.mainChain.length - 1];
    }
    // Get chain length
    getChainLength() {
        return this.mainChain.length;
    }
    // Get active forks
    getActiveForks() {
        return Array.from(this.chains.entries()).map(([tipHash, chain]) => ({
            tipHash,
            length: chain.length,
            heightDiff: this.mainChain.length - chain.length
        }));
    }
    // Check if a block is finalized (deep enough)
    isFinalized(blockHash) {
        const index = this.mainChain.findIndex(b => b.header.hash === blockHash);
        if (index === -1)
            return false;
        const depth = this.mainChain.length - index - 1;
        return depth >= CONFIG.FORK_CHOICE_DEPTH;
    }
    // Initialize with existing chain
    initialize(blocks) {
        this.mainChain = blocks;
        this.chains.clear();
        console.log(`[FORK] Initialized with ${blocks.length} blocks`);
    }
}
exports.ForkManager = ForkManager;
// Proof of AI consensus
class ProofOfAI {
    constructor() {
        this.difficultyManager = new DifficultyManager();
    }
    // Validate block for PoAI consensus
    async validateBlock(block, previousBlock, recentBlocks) {
        // Get AI validation
        const aiResult = await (0, AIValidator_1.validateBlockWithAI)(block, previousBlock);
        // Check AI confidence threshold
        if (aiResult.confidence < CONFIG.AI_CONFIDENCE_THRESHOLD) {
            console.log(`[PoAI] Block rejected: AI confidence ${aiResult.confidence} below threshold ${CONFIG.AI_CONFIDENCE_THRESHOLD}`);
            return { valid: false, aiResult };
        }
        // Check AI valid flag
        if (!aiResult.valid) {
            console.log(`[PoAI] Block rejected by AI: ${aiResult.reasoning}`);
            return { valid: false, aiResult };
        }
        // Check for attack flags
        if (aiResult.flags.potentialAttack) {
            console.log(`[PoAI] Block flagged as potential attack`);
            return { valid: false, aiResult };
        }
        // Adjust difficulty
        if (block.header.height % CONFIG.DIFFICULTY_ADJUSTMENT_INTERVAL === 0) {
            this.difficultyManager.adjustDifficulty(recentBlocks);
        }
        console.log(`[PoAI] Block ${block.header.height} validated (confidence: ${(aiResult.confidence * 100).toFixed(0)}%)`);
        return { valid: true, aiResult };
    }
    getDifficulty() {
        return this.difficultyManager.getCurrentDifficulty();
    }
}
exports.ProofOfAI = ProofOfAI;
// Export singleton instances
exports.difficultyManager = new DifficultyManager();
exports.forkManager = new ForkManager();
exports.proofOfAI = new ProofOfAI();
console.log('[CONSENSUS] Consensus module loaded');
//# sourceMappingURL=Consensus.js.map
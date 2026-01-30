import { Block } from './Block';
import { AIValidationResult } from './AIValidator';
export declare class DifficultyManager {
    private currentDifficulty;
    private blockTimes;
    adjustDifficulty(recentBlocks: Block[]): number;
    getCurrentDifficulty(): number;
    setDifficulty(difficulty: number): void;
    verifyDifficulty(block: Block): boolean;
}
export declare class ForkManager {
    private chains;
    private mainChain;
    addBlock(block: Block, aiResult: AIValidationResult): {
        added: boolean;
        reorg: boolean;
        orphaned: Block[];
    };
    private shouldSwitchToFork;
    private switchToFork;
    getMainChain(): Block[];
    getLatestBlock(): Block | undefined;
    getChainLength(): number;
    getActiveForks(): {
        tipHash: string;
        length: number;
        heightDiff: number;
    }[];
    isFinalized(blockHash: string): boolean;
    initialize(blocks: Block[]): void;
}
export declare class ProofOfAI {
    private difficultyManager;
    constructor();
    validateBlock(block: Block, previousBlock: Block | null, recentBlocks: Block[]): Promise<{
        valid: boolean;
        aiResult: AIValidationResult;
    }>;
    getDifficulty(): number;
}
export declare const difficultyManager: DifficultyManager;
export declare const forkManager: ForkManager;
export declare const proofOfAI: ProofOfAI;
//# sourceMappingURL=Consensus.d.ts.map
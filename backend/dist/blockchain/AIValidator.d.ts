import { Block } from './Block';
export interface AIValidationResult {
    valid: boolean;
    confidence: number;
    reasoning: string;
    warnings: string[];
    flags: {
        suspiciousPattern: boolean;
        unusualGasUsage: boolean;
        potentialAttack: boolean;
        stateInconsistency: boolean;
    };
}
export declare function validateBlockWithAI(block: Block, previousBlock: Block | null): Promise<AIValidationResult>;
export declare function clearValidationCache(): void;
export declare function getValidationStats(): {
    cachedBlocks: number;
    validBlocks: number;
    invalidBlocks: number;
};
//# sourceMappingURL=AIValidator.d.ts.map
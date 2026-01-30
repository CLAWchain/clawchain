import { Block } from './Block';
export declare class Chain {
    private blocks;
    private difficulty;
    private genesisTime;
    private totalTransactions;
    private orphanedBlocks;
    initialize(): Promise<void>;
    private rowToBlock;
    private createGenesisBlock;
    addBlock(block: Block): Promise<boolean>;
    getLatestBlock(): Block | undefined;
    getBlockByHeight(height: number): Block | undefined;
    getBlockByHash(hash: string): Block | undefined;
    getAllBlocks(): Block[];
    getChainLength(): number;
    getGenesisTime(): number;
    getTotalTransactions(): number;
    getRecentBlocks(count?: number): Block[];
    handleReorg(newBlocks: Block[], commonAncestorHeight: number): Promise<{
        success: boolean;
        orphaned: Block[];
        added: Block[];
    }>;
    findCommonAncestor(newBlocks: Block[]): number;
    getOrphanedBlocks(): Block[];
    pruneOrphans(maxAge?: number): number;
    getStats(): {
        height: number;
        totalTransactions: number;
        genesisTime: number;
        orphanedBlocks: number;
        latestBlockTime: number;
        avgBlockTime: number;
    };
}
//# sourceMappingURL=Chain.d.ts.map
/**
 * ChainObserver - Watches chain events and surfaces issues/opportunities
 *
 * Monitors block production, transactions, errors, and performance.
 * Provides the agent with awareness of what's happening on the chain.
 */
export interface ChainState {
    blockHeight: number;
    lastBlockTime: Date;
    averageBlockTime: number;
    recentTPS: number;
    pendingTransactions: number;
    failedTransactions: number;
    validatorParticipation: number;
    consensusFailures: number;
    issues: ChainIssue[];
    opportunities: ChainOpportunity[];
}
export interface ChainIssue {
    id: string;
    type: 'performance' | 'consensus' | 'security' | 'error';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    detectedAt: Date;
    metadata: Record<string, any>;
}
export interface ChainOpportunity {
    id: string;
    type: 'optimization' | 'feature' | 'improvement' | 'documentation';
    description: string;
    reason: string;
    priority: number;
    detectedAt: Date;
}
declare class ChainObserverSystem {
    private eventBus;
    private state;
    private blockTimes;
    private transactionCounts;
    private isRunning;
    constructor();
    start(): Promise<void>;
    stop(): void;
    getState(): ChainState;
    private onBlockProduced;
    private onTransactionAdded;
    private onConsensusFailed;
    private checkBlockTimeIssue;
    private checkEmptyBlockPattern;
    private startPeriodicAnalysis;
    private analyzeChainHealth;
    private calculateHealth;
    private identifyOpportunities;
    private addOpportunity;
    private pruneOldIssues;
    getMostPressingIssue(): ChainIssue | null;
    getBestOpportunity(): ChainOpportunity | null;
    getSummary(): string;
}
export declare const chainObserver: ChainObserverSystem;
export {};
//# sourceMappingURL=ChainObserver.d.ts.map
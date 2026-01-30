import { Transaction } from './Block';
export interface ValidationResult {
    valid: boolean;
    error?: string;
}
export declare class TransactionPool {
    private pendingTransactions;
    private knownHashes;
    initialize(): Promise<void>;
    addTransaction(tx: Transaction): Promise<ValidationResult>;
    getPendingTransactions(limit?: number): Promise<Transaction[]>;
    removeTransactions(hashes: string[]): Promise<void>;
    private validateTransaction;
    private calculateTxHash;
    getPendingCount(): number;
    getPendingForAddress(address: string): Transaction[];
    clearExpired(maxAge?: number): number;
}
//# sourceMappingURL=TransactionPool.d.ts.map
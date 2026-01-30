import { Transaction } from './Block';
export interface AccountState {
    address: string;
    balance: bigint;
    nonce: number;
    codeHash?: string;
    storageRoot?: string;
}
export interface StateChange {
    address: string;
    previousBalance: bigint;
    newBalance: bigint;
    previousNonce: number;
    newNonce: number;
    blockHeight: number;
    txHash?: string;
}
export declare class StateManager {
    private accounts;
    private stateRoot;
    private initialized;
    private stateChanges;
    initialize(): Promise<void>;
    private initializeGenesisState;
    getBalance(address: string): bigint;
    getNonce(address: string): number;
    getAccount(address: string): AccountState | undefined;
    getStateRoot(): string;
    applyTransaction(tx: Transaction, blockHeight: number): Promise<boolean>;
    applyBlockReward(producer: string, blockHeight: number, reward?: bigint): Promise<void>;
    processFaucetRequest(toAddress: string, amount: bigint, blockHeight: number): Promise<boolean>;
    calculateStateRoot(): string;
    private buildMerkleRoot;
    commitBlock(blockHeight: number): Promise<string>;
    getRecentStateChanges(limit?: number): StateChange[];
    getAccountsSummary(): {
        address: string;
        balance: string;
        nonce: number;
    }[];
    getTotalSupply(): bigint;
    getCirculatingSupply(): bigint;
    formatBalance(balance: bigint): string;
    private persistAccountState;
    private persistStateChange;
}
export declare const stateManager: StateManager;
//# sourceMappingURL=StateManager.d.ts.map
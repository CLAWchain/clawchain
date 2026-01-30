import { Transaction } from './Block';
export declare enum TransactionStatus {
    SUCCESS = 1,
    FAILURE = 0,
    OUT_OF_GAS = 2,
    INVALID_SIGNATURE = 3,
    INSUFFICIENT_BALANCE = 4,
    INVALID_NONCE = 5
}
export interface Log {
    address: string;
    topics: string[];
    data: string;
    logIndex: number;
    transactionIndex: number;
    transactionHash: string;
    blockHash: string;
    blockNumber: number;
}
export interface TransactionReceipt {
    transactionHash: string;
    transactionIndex: number;
    blockHash: string;
    blockNumber: number;
    from: string;
    to: string;
    gasUsed: bigint;
    cumulativeGasUsed: bigint;
    status: TransactionStatus;
    logs: Log[];
    logsBloom: string;
    stateRoot?: string;
}
export declare function bloomContains(bloomHex: string, item: string): boolean;
export declare function createReceipt(tx: Transaction, index: number, blockHash: string, blockNumber: number, gasUsed: bigint, cumulativeGasUsed: bigint, status: TransactionStatus, logs?: Log[], stateRoot?: string): TransactionReceipt;
export declare function calculateReceiptsRoot(receipts: TransactionReceipt[]): string;
export declare function encodeReceipt(receipt: TransactionReceipt): string;
export declare function storeReceipt(receipt: TransactionReceipt): void;
export declare function getReceipt(txHash: string): TransactionReceipt | undefined;
export declare function getBlockReceipts(blockNumber: number): TransactionReceipt[];
//# sourceMappingURL=TransactionReceipt.d.ts.map
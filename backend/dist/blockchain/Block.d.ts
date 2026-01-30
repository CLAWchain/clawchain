declare function hexToBase58(hex: string): string;
declare function generateHash(data: string): string;
declare function generateRandomBase58(length?: number): string;
export interface BlockHeader {
    height: number;
    hash: string;
    parentHash: string;
    producer: string;
    timestamp: number;
    nonce: number;
    difficulty: number;
    gasUsed: bigint;
    gasLimit: bigint;
    stateRoot: string;
    transactionsRoot: string;
    receiptsRoot: string;
}
export interface Transaction {
    hash: string;
    from: string;
    to: string;
    value: bigint;
    gasPrice: bigint;
    gasLimit: bigint;
    nonce: number;
    data?: string;
    signature: string;
}
export declare class Block {
    header: BlockHeader;
    transactions: Transaction[];
    constructor(height: number, parentHash: string, producer: string, transactions: Transaction[], difficulty?: number);
    private calculateHash;
    private calculateGasUsed;
    private calculateMerkleRoot;
    private calculateStateRoot;
    setStateRoot(stateRoot: string): void;
    private calculateReceiptsRoot;
    isValid(previousBlock?: Block): boolean;
    toJSON(): {
        gasUsed: string;
        gasLimit: string;
        transactions: {
            value: string;
            gasPrice: string;
            gasLimit: string;
            hash: string;
            from: string;
            to: string;
            nonce: number;
            data?: string;
            signature: string;
        }[];
        height: number;
        hash: string;
        parentHash: string;
        producer: string;
        timestamp: number;
        nonce: number;
        difficulty: number;
        stateRoot: string;
        transactionsRoot: string;
        receiptsRoot: string;
    };
}
export { generateHash, generateRandomBase58, hexToBase58 };
//# sourceMappingURL=Block.d.ts.map
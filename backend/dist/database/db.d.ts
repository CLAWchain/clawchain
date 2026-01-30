export declare const db: {
    exec: (sql: string) => Promise<void>;
    query: (text: string, params?: any[]) => Promise<{
        rows: any[];
        rowCount?: number;
    }>;
    connect: () => Promise<boolean>;
    end: () => Promise<void>;
};
export declare const cache: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string, ttl?: number) => Promise<void>;
    del: (key: string) => Promise<void>;
    getJSON: <T>(key: string) => Promise<T | null>;
    setJSON: (key: string, value: any, ttl?: number) => Promise<void>;
    incr: (key: string) => Promise<number>;
    hget: (key: string, field: string) => Promise<string | null>;
    hset: (key: string, field: string, value: string) => Promise<void>;
    hgetall: (key: string) => Promise<Record<string, string> | null>;
    isConnected: () => boolean;
};
export declare const chainState: {
    saveBlockHeight: (height: number) => Promise<void>;
    getBlockHeight: () => Promise<number>;
    saveChainStartTime: (timestamp: number) => Promise<void>;
    getChainStartTime: () => Promise<number>;
    saveTotalTransactions: (count: number) => Promise<void>;
    getTotalTransactions: () => Promise<number>;
    incrementBlockHeight: () => Promise<number>;
    saveBlock: (block: any) => Promise<void>;
    getBlock: (height: number) => Promise<any | null>;
    getBlockHeightByHash: (hash: string) => Promise<number | null>;
};
//# sourceMappingURL=db.d.ts.map
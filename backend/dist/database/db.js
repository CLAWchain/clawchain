"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chainState = exports.cache = exports.db = void 0;
const pg_1 = require("pg");
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
// PostgreSQL connection - uses Railway's DATABASE_URL
const DATABASE_URL = process.env.DATABASE_URL;
let pool = null;
let redis = null;
// Initialize PostgreSQL
if (DATABASE_URL) {
    pool = new pg_1.Pool({
        connectionString: DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });
    console.log('[DB] PostgreSQL pool created');
}
else {
    console.warn('[DB] DATABASE_URL not set - using in-memory fallback');
}
// Initialize Redis - uses Railway's REDIS_URL
const REDIS_URL = process.env.REDIS_URL;
if (REDIS_URL) {
    redis = new ioredis_1.default(REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => Math.min(times * 100, 3000),
    });
    redis.on('connect', () => {
        console.log('[REDIS] Connected');
    });
    redis.on('error', (err) => {
        console.error('[REDIS] Error:', err);
    });
}
else {
    console.warn('[REDIS] REDIS_URL not set - caching disabled');
}
// In-memory fallback storage
const memoryStore = {
    blocks: [],
    transactions: [],
    accounts: [],
    validators: [],
    cips: [],
    cip_votes: [],
    debate_messages: [],
    chat_logs: [],
    consensus_events: [],
};
exports.db = {
    // Execute schema creation (multiple statements)
    exec: async (sql) => {
        if (!pool) {
            console.log('Using in-memory storage (no DATABASE_URL)');
            return;
        }
        try {
            // Split by semicolon and execute each statement
            const statements = sql.split(';').filter(s => s.trim().length > 0);
            for (const statement of statements) {
                await pool.query(statement);
            }
        }
        catch (error) {
            console.error('Database exec error:', error);
            throw error;
        }
    },
    // Execute single query with parameters
    query: async (text, params = []) => {
        if (!pool) {
            // Fallback to memory
            return { rows: [], rowCount: 0 };
        }
        try {
            const result = await pool.query(text, params);
            return { rows: result.rows, rowCount: result.rowCount || 0 };
        }
        catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    },
    // Test connection
    connect: async () => {
        if (!pool) {
            console.log('[DB] Using in-memory storage');
            return true;
        }
        try {
            const client = await pool.connect();
            await client.query('SELECT 1');
            client.release();
            console.log('[DB] PostgreSQL connected');
            return true;
        }
        catch (error) {
            console.error('[DB] PostgreSQL connection failed:', error);
            return false;
        }
    },
    // Close connections
    end: async () => {
        if (pool)
            await pool.end();
        if (redis)
            redis.disconnect();
    }
};
// Redis cache helper
exports.cache = {
    // Get cached value
    get: async (key) => {
        if (!redis)
            return null;
        try {
            return await redis.get(key);
        }
        catch (error) {
            console.error('Redis get error:', error);
            return null;
        }
    },
    // Set cached value with optional TTL (seconds)
    set: async (key, value, ttl) => {
        if (!redis)
            return;
        try {
            if (ttl) {
                await redis.setex(key, ttl, value);
            }
            else {
                await redis.set(key, value);
            }
        }
        catch (error) {
            console.error('Redis set error:', error);
        }
    },
    // Delete cached value
    del: async (key) => {
        if (!redis)
            return;
        try {
            await redis.del(key);
        }
        catch (error) {
            console.error('Redis del error:', error);
        }
    },
    // Get JSON object
    getJSON: async (key) => {
        const value = await exports.cache.get(key);
        if (!value)
            return null;
        try {
            return JSON.parse(value);
        }
        catch {
            return null;
        }
    },
    // Set JSON object
    setJSON: async (key, value, ttl) => {
        await exports.cache.set(key, JSON.stringify(value), ttl);
    },
    // Increment counter
    incr: async (key) => {
        if (!redis)
            return 0;
        try {
            return await redis.incr(key);
        }
        catch (error) {
            console.error('Redis incr error:', error);
            return 0;
        }
    },
    // Get hash field
    hget: async (key, field) => {
        if (!redis)
            return null;
        try {
            return await redis.hget(key, field);
        }
        catch (error) {
            console.error('Redis hget error:', error);
            return null;
        }
    },
    // Set hash field
    hset: async (key, field, value) => {
        if (!redis)
            return;
        try {
            await redis.hset(key, field, value);
        }
        catch (error) {
            console.error('Redis hset error:', error);
        }
    },
    // Get all hash fields
    hgetall: async (key) => {
        if (!redis)
            return null;
        try {
            return await redis.hgetall(key);
        }
        catch (error) {
            console.error('Redis hgetall error:', error);
            return null;
        }
    },
    // Check if connected
    isConnected: () => {
        return redis !== null && redis.status === 'ready';
    }
};
// Chain state persistence helpers
exports.chainState = {
    // Save the latest block height
    saveBlockHeight: async (height) => {
        await exports.cache.set('chain:block_height', height.toString());
    },
    // Get the latest block height
    getBlockHeight: async () => {
        const height = await exports.cache.get('chain:block_height');
        return height ? parseInt(height, 10) : 0;
    },
    // Save chain start time
    saveChainStartTime: async (timestamp) => {
        await exports.cache.set('chain:start_time', timestamp.toString());
    },
    // Get chain start time
    getChainStartTime: async () => {
        const time = await exports.cache.get('chain:start_time');
        return time ? parseInt(time, 10) : Date.now();
    },
    // Save total transactions count
    saveTotalTransactions: async (count) => {
        await exports.cache.set('chain:total_transactions', count.toString());
    },
    // Get total transactions count
    getTotalTransactions: async () => {
        const count = await exports.cache.get('chain:total_transactions');
        return count ? parseInt(count, 10) : 0;
    },
    // Increment block height atomically
    incrementBlockHeight: async () => {
        return await exports.cache.incr('chain:block_height');
    },
    // Save a block to cache (for quick retrieval)
    saveBlock: async (block) => {
        await exports.cache.setJSON(`block:${block.height}`, block);
        await exports.cache.set(`block:hash:${block.hash}`, block.height.toString());
    },
    // Get block by height from cache
    getBlock: async (height) => {
        return await exports.cache.getJSON(`block:${height}`);
    },
    // Get block height by hash
    getBlockHeightByHash: async (hash) => {
        const height = await exports.cache.get(`block:hash:${hash}`);
        return height ? parseInt(height, 10) : null;
    }
};
//# sourceMappingURL=db.js.map
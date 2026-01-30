import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from '../database/db';

const authRouter = Router();

// ============ API KEY MANAGEMENT ============

interface ApiKey {
  id: string;
  key: string;
  name: string;
  permissions: string[];
  rateLimit: number; // requests per minute
  createdAt: Date;
  lastUsed: Date | null;
  usageCount: number;
  active: boolean;
}

// In-memory store (backed by database)
const apiKeys: Map<string, ApiKey> = new Map();
const rateLimitBuckets: Map<string, { count: number; resetAt: number }> = new Map();

// Initialize API keys table
export async function initializeAuthTables(): Promise<void> {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id VARCHAR(64) PRIMARY KEY,
        key_hash VARCHAR(128) NOT NULL,
        name VARCHAR(255) NOT NULL,
        permissions TEXT[] DEFAULT '{}',
        rate_limit INTEGER DEFAULT 60,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_used TIMESTAMP,
        usage_count INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64),
        token_hash VARCHAR(128) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Load existing API keys
    const result = await db.query('SELECT * FROM api_keys WHERE active = true');
    for (const row of result.rows) {
      // Note: we store the hash, not the actual key
      // The key itself is only shown once when created
      apiKeys.set(row.id, {
        id: row.id,
        key: row.key_hash, // This is the hash, not the actual key
        name: row.name,
        permissions: row.permissions || [],
        rateLimit: row.rate_limit,
        createdAt: new Date(row.created_at),
        lastUsed: row.last_used ? new Date(row.last_used) : null,
        usageCount: row.usage_count,
        active: row.active
      });
    }

    console.log(`[AUTH] Loaded ${apiKeys.size} API keys`);
  } catch (error) {
    console.error('[AUTH] Failed to initialize auth tables:', error);
  }
}

// Generate a new API key
function generateApiKey(): string {
  const prefix = 'claw_';
  const randomPart = crypto.randomBytes(24).toString('hex');
  return `${prefix}${randomPart}`;
}

// Hash an API key for storage
function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

// Create a new API key
authRouter.post('/keys', async (req, res) => {
  try {
    const { name, permissions = ['read'], rateLimit = 60 } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const id = `key_${Date.now().toString(36)}${crypto.randomBytes(4).toString('hex')}`;
    const key = generateApiKey();
    const keyHash = hashApiKey(key);

    const apiKey: ApiKey = {
      id,
      key: keyHash,
      name,
      permissions,
      rateLimit,
      createdAt: new Date(),
      lastUsed: null,
      usageCount: 0,
      active: true
    };

    // Save to database
    await db.query(`
      INSERT INTO api_keys (id, key_hash, name, permissions, rate_limit, created_at, active)
      VALUES ($1, $2, $3, $4, $5, $6, true)
    `, [id, keyHash, name, permissions, rateLimit, apiKey.createdAt]);

    apiKeys.set(id, apiKey);

    // Return the key only once - it won't be shown again
    res.json({
      success: true,
      apiKey: {
        id,
        key, // Only shown once!
        name,
        permissions,
        rateLimit,
        createdAt: apiKey.createdAt
      },
      warning: 'Save this key now! It will not be shown again.'
    });

  } catch (error) {
    console.error('[AUTH] Error creating API key:', error);
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

// List API keys (without the actual key values)
authRouter.get('/keys', async (req, res) => {
  const keys = Array.from(apiKeys.values()).map(k => ({
    id: k.id,
    name: k.name,
    permissions: k.permissions,
    rateLimit: k.rateLimit,
    createdAt: k.createdAt,
    lastUsed: k.lastUsed,
    usageCount: k.usageCount,
    active: k.active
  }));

  res.json({ keys });
});

// Revoke an API key
authRouter.delete('/keys/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!apiKeys.has(id)) {
      return res.status(404).json({ error: 'API key not found' });
    }

    await db.query('UPDATE api_keys SET active = false WHERE id = $1', [id]);
    apiKeys.delete(id);

    res.json({ success: true, message: 'API key revoked' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to revoke API key' });
  }
});

// ============ RATE LIMITING ============

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const defaultRateLimit: RateLimitConfig = {
  windowMs: 60000, // 1 minute
  maxRequests: 60  // 60 requests per minute
};

// Check rate limit for a key or IP
function checkRateLimit(identifier: string, limit: number = defaultRateLimit.maxRequests): boolean {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(identifier);

  if (!bucket || now > bucket.resetAt) {
    // Create or reset bucket
    rateLimitBuckets.set(identifier, {
      count: 1,
      resetAt: now + defaultRateLimit.windowMs
    });
    return true;
  }

  if (bucket.count >= limit) {
    return false;
  }

  bucket.count++;
  return true;
}

// Get remaining rate limit
function getRateLimitRemaining(identifier: string, limit: number = defaultRateLimit.maxRequests): number {
  const bucket = rateLimitBuckets.get(identifier);
  if (!bucket || Date.now() > bucket.resetAt) {
    return limit;
  }
  return Math.max(0, limit - bucket.count);
}

// ============ MIDDLEWARE ============

// API key authentication middleware
export function apiKeyAuth(requiredPermission?: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const apiKeyHeader = req.headers['x-api-key'] as string;
    
    let providedKey: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      providedKey = authHeader.slice(7);
    } else if (apiKeyHeader) {
      providedKey = apiKeyHeader;
    }

    if (!providedKey) {
      // No API key - continue without auth (public endpoint)
      return next();
    }

    // Hash the provided key and look it up
    const keyHash = hashApiKey(providedKey);
    
    // Find the key by hash
    let foundKey: ApiKey | null = null;
    for (const key of apiKeys.values()) {
      if (key.key === keyHash && key.active) {
        foundKey = key;
        break;
      }
    }

    if (!foundKey) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Check permissions
    if (requiredPermission && !foundKey.permissions.includes(requiredPermission) && !foundKey.permissions.includes('admin')) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Check rate limit
    if (!checkRateLimit(foundKey.id, foundKey.rateLimit)) {
      const remaining = getRateLimitRemaining(foundKey.id, foundKey.rateLimit);
      res.set('X-RateLimit-Remaining', remaining.toString());
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil(defaultRateLimit.windowMs / 1000)
      });
    }

    // Update usage stats
    foundKey.lastUsed = new Date();
    foundKey.usageCount++;
    
    // Update in database (async, don't wait)
    db.query(
      'UPDATE api_keys SET last_used = $1, usage_count = usage_count + 1 WHERE id = $2',
      [foundKey.lastUsed, foundKey.id]
    ).catch(() => {});

    // Add key info to request
    (req as any).apiKey = foundKey;
    
    // Add rate limit headers
    res.set('X-RateLimit-Limit', foundKey.rateLimit.toString());
    res.set('X-RateLimit-Remaining', getRateLimitRemaining(foundKey.id, foundKey.rateLimit).toString());

    next();
  };
}

// IP-based rate limiting middleware (for unauthenticated requests)
export function ipRateLimit(maxRequests: number = 30) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
    if (!checkRateLimit(`ip:${ip}`, maxRequests)) {
      res.set('X-RateLimit-Remaining', '0');
      return res.status(429).json({ 
        error: 'Too many requests',
        retryAfter: Math.ceil(defaultRateLimit.windowMs / 1000)
      });
    }

    res.set('X-RateLimit-Remaining', getRateLimitRemaining(`ip:${ip}`, maxRequests).toString());
    next();
  };
}

// ============ SESSION MANAGEMENT ============

interface Session {
  id: string;
  userId: string | null;
  token: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivity: Date;
}

const sessions: Map<string, Session> = new Map();

// Generate session token
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Create a new session
authRouter.post('/sessions', async (req, res) => {
  try {
    const { userId } = req.body;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const id = `sess_${Date.now().toString(36)}${crypto.randomBytes(4).toString('hex')}`;
    const token = generateSessionToken();
    const tokenHash = hashApiKey(token);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    const session: Session = {
      id,
      userId: userId || null,
      token: tokenHash,
      ipAddress: ip,
      userAgent,
      createdAt: now,
      expiresAt,
      lastActivity: now
    };

    // Save to database
    await db.query(`
      INSERT INTO user_sessions (id, user_id, token_hash, ip_address, user_agent, created_at, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [id, session.userId, tokenHash, ip, userAgent, now, expiresAt]);

    sessions.set(id, session);

    res.json({
      success: true,
      session: {
        id,
        token, // Only shown once!
        expiresAt
      }
    });

  } catch (error) {
    console.error('[AUTH] Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Validate session
authRouter.get('/sessions/validate', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ valid: false, error: 'No token provided' });
  }

  const tokenHash = hashApiKey(token);
  
  // Find session by token hash
  let foundSession: Session | null = null;
  for (const session of sessions.values()) {
    if (session.token === tokenHash) {
      foundSession = session;
      break;
    }
  }

  if (!foundSession) {
    // Check database
    try {
      const result = await db.query(
        'SELECT * FROM user_sessions WHERE token_hash = $1 AND expires_at > NOW()',
        [tokenHash]
      );
      if (result.rows.length > 0) {
        const row = result.rows[0];
        foundSession = {
          id: row.id,
          userId: row.user_id,
          token: row.token_hash,
          ipAddress: row.ip_address,
          userAgent: row.user_agent,
          createdAt: new Date(row.created_at),
          expiresAt: new Date(row.expires_at),
          lastActivity: new Date(row.last_activity)
        };
        sessions.set(foundSession.id, foundSession);
      }
    } catch (e) {
      // Ignore
    }
  }

  if (!foundSession || new Date() > foundSession.expiresAt) {
    return res.json({ valid: false, error: 'Session expired or invalid' });
  }

  // Update last activity
  foundSession.lastActivity = new Date();
  db.query(
    'UPDATE user_sessions SET last_activity = NOW() WHERE id = $1',
    [foundSession.id]
  ).catch(() => {});

  res.json({
    valid: true,
    session: {
      id: foundSession.id,
      userId: foundSession.userId,
      expiresAt: foundSession.expiresAt
    }
  });
});

// Delete session (logout)
authRouter.delete('/sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    sessions.delete(id);
    await db.query('DELETE FROM user_sessions WHERE id = $1', [id]);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// Rate limit status endpoint
authRouter.get('/rate-limit', (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const apiKey = (req as any).apiKey;
  
  const identifier = apiKey ? apiKey.id : `ip:${ip}`;
  const limit = apiKey ? apiKey.rateLimit : defaultRateLimit.maxRequests;
  
  res.json({
    limit,
    remaining: getRateLimitRemaining(identifier, limit),
    resetIn: defaultRateLimit.windowMs / 1000
  });
});

export { authRouter };

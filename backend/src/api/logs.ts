import { Router } from 'express';
import { db } from '../database/db';
import { eventBus } from '../events/EventBus';

const logsRouter = Router();

// Log entry interface
export interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'task_start' | 'task_complete' | 'output' | 'tool_use' | 'git_commit' | 'error' | 'system';
  taskId?: string;
  taskTitle?: string;
  content: string;
  metadata?: any;
}

// In-memory log buffer (also persisted to DB)
const logBuffer: LogEntry[] = [];
const MAX_BUFFER_SIZE = 500;

// Initialize logs table
export async function initializeLogsTable(): Promise<void> {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS agent_logs (
        id VARCHAR(64) PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        type VARCHAR(32) NOT NULL,
        task_id VARCHAR(64),
        task_title VARCHAR(255),
        content TEXT NOT NULL,
        metadata JSONB
      )
    `);
    
    // Create index for faster queries
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_agent_logs_timestamp ON agent_logs(timestamp DESC)
    `);
    
    // Load recent logs into buffer
    const result = await db.query(`
      SELECT * FROM agent_logs ORDER BY timestamp DESC LIMIT 100
    `);
    
    for (const row of result.rows.reverse()) {
      logBuffer.push({
        id: row.id,
        timestamp: new Date(row.timestamp),
        type: row.type,
        taskId: row.task_id,
        taskTitle: row.task_title,
        content: row.content,
        metadata: row.metadata
      });
    }
    
    console.log(`[LOGS] Loaded ${logBuffer.length} log entries from database`);
  } catch (error) {
    console.error('[LOGS] Failed to initialize logs table:', error);
  }
}

// Add a log entry
export function addLog(
  type: LogEntry['type'],
  content: string,
  taskId?: string,
  taskTitle?: string,
  metadata?: any
): LogEntry {
  const entry: LogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date(),
    type,
    taskId,
    taskTitle,
    content,
    metadata
  };
  
  // Add to buffer
  logBuffer.push(entry);
  if (logBuffer.length > MAX_BUFFER_SIZE) {
    logBuffer.shift();
  }
  
  // Persist to database (async, don't wait)
  db.query(`
    INSERT INTO agent_logs (id, timestamp, type, task_id, task_title, content, metadata)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [entry.id, entry.timestamp, entry.type, entry.taskId, entry.taskTitle, entry.content, JSON.stringify(entry.metadata)])
    .catch(err => console.error('[LOGS] Failed to persist log:', err));
  
  // Emit event for SSE
  eventBus.emit('new_log', entry);
  
  return entry;
}

// Get logs
logsRouter.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
  const before = req.query.before as string;
  const type = req.query.type as string;
  
  try {
    let query = 'SELECT * FROM agent_logs';
    const params: any[] = [];
    const conditions: string[] = [];
    
    if (before) {
      conditions.push(`timestamp < $${params.length + 1}`);
      params.push(new Date(before));
    }
    
    if (type) {
      conditions.push(`type = $${params.length + 1}`);
      params.push(type);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ` ORDER BY timestamp DESC LIMIT $${params.length + 1}`;
    params.push(limit);
    
    const result = await db.query(query, params);
    
    res.json({
      logs: result.rows.map(row => ({
        id: row.id,
        timestamp: row.timestamp,
        type: row.type,
        taskId: row.task_id,
        taskTitle: row.task_title,
        content: row.content,
        metadata: row.metadata
      })).reverse(), // Return in chronological order
      hasMore: result.rows.length === limit
    });
  } catch (error) {
    // Fallback to buffer
    res.json({
      logs: logBuffer.slice(-limit),
      hasMore: false
    });
  }
});

// Get recent logs from buffer (faster)
logsRouter.get('/recent', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
  res.json({
    logs: logBuffer.slice(-limit)
  });
});

// SSE endpoint for live logs
logsRouter.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();
  
  // Send recent logs
  const recentLogs = logBuffer.slice(-20);
  res.write(`data: ${JSON.stringify({ type: 'init', logs: recentLogs })}\n\n`);
  
  // Listen for new logs
  const onNewLog = (entry: LogEntry) => {
    res.write(`data: ${JSON.stringify({ type: 'log', entry })}\n\n`);
  };
  
  eventBus.on('new_log', onNewLog);
  
  // Heartbeat
  const heartbeat = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);
  }, 15000);
  
  req.on('close', () => {
    eventBus.off('new_log', onNewLog);
    clearInterval(heartbeat);
  });
});

// Get log stats
logsRouter.get('/stats', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        type,
        COUNT(*) as count,
        MAX(timestamp) as last_entry
      FROM agent_logs 
      GROUP BY type
    `);
    
    const totalResult = await db.query('SELECT COUNT(*) as total FROM agent_logs');
    
    res.json({
      total: parseInt(totalResult.rows[0]?.total || '0'),
      byType: result.rows.reduce((acc, row) => {
        acc[row.type] = {
          count: parseInt(row.count),
          lastEntry: row.last_entry
        };
        return acc;
      }, {} as Record<string, { count: number; lastEntry: Date }>)
    });
  } catch (error) {
    res.json({
      total: logBuffer.length,
      byType: {}
    });
  }
});

export { logsRouter };

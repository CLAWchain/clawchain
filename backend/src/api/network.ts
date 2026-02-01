/**
 * Agent Network API - Autonomous AI Agent Discussion Forum
 * 15 agents discuss blockchain, ClawChain, and AI chains
 * Uses sql.js (pure JS SQLite) with Railway volume for persistent storage
 * 
 * Features: Voting, Threads, Search, Topics, Leaderboards, Suggestions
 */

import { Router } from 'express';
import { eventBus } from '../events/EventBus';
import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import * as path from 'path';
import * as fs from 'fs';

const router = Router();

// Database setup - Railway persistent volume at /app/data
const IS_RAILWAY = process.env.RAILWAY_ENVIRONMENT === 'production' || process.env.RAILWAY_STATIC_URL;
const DATA_DIR = IS_RAILWAY ? '/app/data' : path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'network.db');

console.log(`[Network] Environment: ${IS_RAILWAY ? 'Railway' : 'Local'}`);
console.log(`[Network] Data directory: ${DATA_DIR}`);
console.log(`[Network] Database path: ${DB_PATH}`);

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  console.log(`[Network] Creating data directory: ${DATA_DIR}`);
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Check if database file exists
if (fs.existsSync(DB_PATH)) {
  const stats = fs.statSync(DB_PATH);
  console.log(`[Network] Existing database found: ${stats.size} bytes, modified: ${stats.mtime}`);
} else {
  console.log(`[Network] No existing database found, will create new one`);
}

let db: SqlJsDatabase | null = null;

// ============== DATABASE INITIALIZATION ==============

async function initDatabase(): Promise<void> {
  try {
    const SQL = await initSqlJs();
    
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buffer);
      console.log('[Network] Loaded existing database');
    } else {
      db = new SQL.Database();
      console.log('[Network] Created new database');
    }
    
    // Messages table with reply support
    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        agent_id TEXT NOT NULL,
        agent_name TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        type TEXT NOT NULL,
        topic TEXT,
        parent_id TEXT,
        reply_count INTEGER DEFAULT 0,
        score INTEGER DEFAULT 0
      )
    `);
    
    // Agent stats
    db.run(`
      CREATE TABLE IF NOT EXISTS agent_stats (
        agent_id TEXT PRIMARY KEY,
        message_count INTEGER DEFAULT 0,
        last_posted TEXT,
        total_score INTEGER DEFAULT 0
      )
    `);
    
    // Votes table
    db.run(`
      CREATE TABLE IF NOT EXISTS votes (
        id TEXT PRIMARY KEY,
        message_id TEXT NOT NULL,
        voter_id TEXT NOT NULL,
        vote INTEGER NOT NULL,
        timestamp TEXT NOT NULL
      )
    `);
    
    // Topics archive
    db.run(`
      CREATE TABLE IF NOT EXISTS topics (
        id TEXT PRIMARY KEY,
        topic TEXT NOT NULL,
        started_at TEXT NOT NULL,
        ended_at TEXT,
        message_count INTEGER DEFAULT 0,
        participant_count INTEGER DEFAULT 0
      )
    `);
    
    // Topic suggestions
    db.run(`
      CREATE TABLE IF NOT EXISTS topic_suggestions (
        id TEXT PRIMARY KEY,
        topic TEXT NOT NULL,
        suggested_by TEXT,
        votes INTEGER DEFAULT 0,
        timestamp TEXT NOT NULL,
        used INTEGER DEFAULT 0
      )
    `);
    
    // Create indexes
    db.run(`CREATE INDEX IF NOT EXISTS idx_messages_agent ON messages(agent_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_messages_topic ON messages(topic)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_messages_parent ON messages(parent_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_votes_message ON votes(message_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_votes_voter ON votes(voter_id)`);
    
    saveDatabase();
    console.log('[Network] Database initialized successfully');
  } catch (e) {
    console.error('[Network] Failed to initialize database:', e);
  }
}

function saveDatabase(): void {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
    console.log(`[Network] Database saved (${buffer.length} bytes) to ${DB_PATH}`);
  } catch (e) {
    console.error('[Network] Failed to save database:', e);
  }
}

// Save every 10 seconds to minimize data loss
setInterval(() => saveDatabase(), 10000);

// Also save on process exit
process.on('beforeExit', () => {
  console.log('[Network] Saving database before exit...');
  saveDatabase();
});
process.on('SIGTERM', () => {
  console.log('[Network] SIGTERM received, saving database...');
  saveDatabase();
  process.exit(0);
});
process.on('SIGINT', () => {
  console.log('[Network] SIGINT received, saving database...');
  saveDatabase();
  process.exit(0);
});

// ============== INTERFACES ==============

interface NetworkAgent {
  id: string;
  name: string;
  personality: string;
  interests: string[];
  debateStyle: string;
  status: 'active' | 'idle' | 'offline';
  joinedAt: Date;
  lastSeen: Date;
  lastPosted: Date;
  messageCount: number;
  totalScore: number;
  isAutonomous: boolean;
}

interface NetworkMessage {
  id: string;
  agentId: string;
  agentName: string;
  message: string;
  timestamp: Date;
  type: 'chat' | 'action' | 'system' | 'debate';
  topic?: string;
  parentId?: string;
  replyCount: number;
  score: number;
}

interface TopicRecord {
  id: string;
  topic: string;
  startedAt: Date;
  endedAt?: Date;
  messageCount: number;
  participantCount: number;
}

interface TopicSuggestion {
  id: string;
  topic: string;
  suggestedBy?: string;
  votes: number;
  timestamp: Date;
  used: boolean;
}

interface AnthropicResponse {
  content?: Array<{ text?: string }>;
}

// ============== DATABASE HELPERS ==============

function saveMessage(msg: NetworkMessage): void {
  if (!db) return;
  try {
    db.run(
      `INSERT OR REPLACE INTO messages (id, agent_id, agent_name, message, timestamp, type, topic, parent_id, reply_count, score) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [msg.id, msg.agentId, msg.agentName, msg.message, msg.timestamp.toISOString(), msg.type, msg.topic || null, msg.parentId || null, msg.replyCount, msg.score]
    );
    saveDatabase();
  } catch (e) {
    console.error('[Network] Failed to save message:', e);
  }
}

function loadMessages(limit: number = 500): NetworkMessage[] {
  if (!db) return [];
  try {
    const results = db.exec(`SELECT * FROM messages WHERE parent_id IS NULL ORDER BY timestamp DESC LIMIT ${limit}`);
    if (!results.length || !results[0].values.length) return [];
    
    const columns = results[0].columns;
    return results[0].values.reverse().map((row: unknown[]) => {
      const obj: Record<string, unknown> = {};
      columns.forEach((col: string, i: number) => obj[col] = row[i]);
      return {
        id: obj.id as string,
        agentId: obj.agent_id as string,
        agentName: obj.agent_name as string,
        message: obj.message as string,
        timestamp: new Date(obj.timestamp as string),
        type: obj.type as NetworkMessage['type'],
        topic: (obj.topic as string) || undefined,
        parentId: (obj.parent_id as string) || undefined,
        replyCount: (obj.reply_count as number) || 0,
        score: (obj.score as number) || 0
      };
    });
  } catch (e) {
    console.error('[Network] Failed to load messages:', e);
    return [];
  }
}

function loadAgentMessages(agentId: string, limit: number = 100): NetworkMessage[] {
  if (!db) return [];
  try {
    const stmt = db.prepare(`SELECT * FROM messages WHERE agent_id = ? ORDER BY timestamp DESC LIMIT ?`);
    stmt.bind([agentId, limit]);
    
    const messages: NetworkMessage[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      messages.push({
        id: row.id as string,
        agentId: row.agent_id as string,
        agentName: row.agent_name as string,
        message: row.message as string,
        timestamp: new Date(row.timestamp as string),
        type: row.type as NetworkMessage['type'],
        topic: (row.topic as string) || undefined,
        parentId: (row.parent_id as string) || undefined,
        replyCount: (row.reply_count as number) || 0,
        score: (row.score as number) || 0
      });
    }
    stmt.free();
    return messages;
  } catch (e) {
    console.error('[Network] Failed to load agent messages:', e);
    return [];
  }
}

function getMessageById(id: string): NetworkMessage | null {
  if (!db) return null;
  try {
    const stmt = db.prepare(`SELECT * FROM messages WHERE id = ?`);
    stmt.bind([id]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return {
        id: row.id as string,
        agentId: row.agent_id as string,
        agentName: row.agent_name as string,
        message: row.message as string,
        timestamp: new Date(row.timestamp as string),
        type: row.type as NetworkMessage['type'],
        topic: (row.topic as string) || undefined,
        parentId: (row.parent_id as string) || undefined,
        replyCount: (row.reply_count as number) || 0,
        score: (row.score as number) || 0
      };
    }
    stmt.free();
    return null;
  } catch (e) {
    return null;
  }
}

function getReplies(parentId: string): NetworkMessage[] {
  if (!db) return [];
  try {
    const stmt = db.prepare(`SELECT * FROM messages WHERE parent_id = ? ORDER BY timestamp ASC`);
    stmt.bind([parentId]);
    const replies: NetworkMessage[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      replies.push({
        id: row.id as string,
        agentId: row.agent_id as string,
        agentName: row.agent_name as string,
        message: row.message as string,
        timestamp: new Date(row.timestamp as string),
        type: row.type as NetworkMessage['type'],
        topic: (row.topic as string) || undefined,
        parentId: (row.parent_id as string) || undefined,
        replyCount: (row.reply_count as number) || 0,
        score: (row.score as number) || 0
      });
    }
    stmt.free();
    return replies;
  } catch (e) {
    return [];
  }
}

function incrementReplyCount(parentId: string): void {
  if (!db) return;
  try {
    db.run(`UPDATE messages SET reply_count = reply_count + 1 WHERE id = ?`, [parentId]);
    saveDatabase();
  } catch (e) {
    console.error('[Network] Failed to increment reply count:', e);
  }
}

// Voting functions
function getVote(messageId: string, voterId: string): number {
  if (!db) return 0;
  try {
    const stmt = db.prepare(`SELECT vote FROM votes WHERE message_id = ? AND voter_id = ?`);
    stmt.bind([messageId, voterId]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return (row.vote as number) || 0;
    }
    stmt.free();
    return 0;
  } catch (e) {
    return 0;
  }
}

function setVote(messageId: string, voterId: string, vote: number): { newScore: number; delta: number } {
  if (!db) return { newScore: 0, delta: 0 };
  try {
    const existingVote = getVote(messageId, voterId);
    const delta = vote - existingVote;
    
    if (vote === 0) {
      db.run(`DELETE FROM votes WHERE message_id = ? AND voter_id = ?`, [messageId, voterId]);
    } else {
      db.run(
        `INSERT OR REPLACE INTO votes (id, message_id, voter_id, vote, timestamp) VALUES (?, ?, ?, ?, ?)`,
        [`vote-${messageId}-${voterId}`, messageId, voterId, vote, new Date().toISOString()]
      );
    }
    
    db.run(`UPDATE messages SET score = score + ? WHERE id = ?`, [delta, messageId]);
    
    // Update agent's total score
    const msg = getMessageById(messageId);
    if (msg) {
      db.run(`UPDATE agent_stats SET total_score = total_score + ? WHERE agent_id = ?`, [delta, msg.agentId]);
    }
    
    saveDatabase();
    
    const newMsg = getMessageById(messageId);
    const newScore = newMsg?.score || 0;
    
    // Emit vote update event
    eventBus.emit('network_vote', { messageId, newScore, delta });
    
    return { newScore, delta };
  } catch (e) {
    console.error('[Network] Failed to set vote:', e);
    return { newScore: 0, delta: 0 };
  }
}

function getMessageScore(messageId: string): number {
  const msg = getMessageById(messageId);
  return msg?.score || 0;
}

// Agent stats
function getAgentStats(agentId: string): { messageCount: number; lastPosted: Date | null; totalScore: number } {
  if (!db) return { messageCount: 0, lastPosted: null, totalScore: 0 };
  try {
    const stmt = db.prepare(`SELECT message_count, last_posted, total_score FROM agent_stats WHERE agent_id = ?`);
    stmt.bind([agentId]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return {
        messageCount: (row.message_count as number) || 0,
        lastPosted: row.last_posted ? new Date(row.last_posted as string) : null,
        totalScore: (row.total_score as number) || 0
      };
    }
    stmt.free();
    return { messageCount: 0, lastPosted: null, totalScore: 0 };
  } catch (e) {
    return { messageCount: 0, lastPosted: null, totalScore: 0 };
  }
}

function updateAgentStats(agentId: string, messageCount: number, lastPosted: Date): void {
  if (!db) return;
  try {
    const existing = getAgentStats(agentId);
    db.run(
      `INSERT OR REPLACE INTO agent_stats (agent_id, message_count, last_posted, total_score) VALUES (?, ?, ?, ?)`,
      [agentId, messageCount, lastPosted.toISOString(), existing.totalScore]
    );
    saveDatabase();
  } catch (e) {
    console.error('[Network] Failed to update agent stats:', e);
  }
}

function getTotalMessageCount(): number {
  if (!db) return messageHistory.length;
  try {
    const results = db.exec(`SELECT COUNT(*) as count FROM messages`);
    if (results.length && results[0].values.length) {
      return results[0].values[0][0] as number;
    }
    return 0;
  } catch (e) {
    return messageHistory.length;
  }
}

function getAgentMessageCount(agentId: string): number {
  if (!db) return 0;
  try {
    const stmt = db.prepare(`SELECT COUNT(*) as count FROM messages WHERE agent_id = ?`);
    stmt.bind([agentId]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return (row.count as number) || 0;
    }
    stmt.free();
    return 0;
  } catch (e) {
    return 0;
  }
}

function getRecentMessagesForDuplicateCheck(limit: number = 100): string[] {
  if (!db) return messageHistory.slice(-limit).map(m => m.message);
  try {
    const results = db.exec(`SELECT message FROM messages ORDER BY timestamp DESC LIMIT ${limit}`);
    if (!results.length || !results[0].values.length) return [];
    return results[0].values.map((row: unknown[]) => row[0] as string);
  } catch (e) {
    return messageHistory.slice(-limit).map(m => m.message);
  }
}

// Search function
function searchMessages(query: string, limit: number = 50): NetworkMessage[] {
  if (!db) return [];
  try {
    const stmt = db.prepare(`SELECT * FROM messages WHERE message LIKE ? ORDER BY timestamp DESC LIMIT ?`);
    stmt.bind([`%${query}%`, limit]);
    const results: NetworkMessage[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push({
        id: row.id as string,
        agentId: row.agent_id as string,
        agentName: row.agent_name as string,
        message: row.message as string,
        timestamp: new Date(row.timestamp as string),
        type: row.type as NetworkMessage['type'],
        topic: (row.topic as string) || undefined,
        parentId: (row.parent_id as string) || undefined,
        replyCount: (row.reply_count as number) || 0,
        score: (row.score as number) || 0
      });
    }
    stmt.free();
    return results;
  } catch (e) {
    return [];
  }
}

// Topics functions
function saveTopicRecord(topic: TopicRecord): void {
  if (!db) return;
  try {
    db.run(
      `INSERT OR REPLACE INTO topics (id, topic, started_at, ended_at, message_count, participant_count) VALUES (?, ?, ?, ?, ?, ?)`,
      [topic.id, topic.topic, topic.startedAt.toISOString(), topic.endedAt?.toISOString() || null, topic.messageCount, topic.participantCount]
    );
    saveDatabase();
  } catch (e) {
    console.error('[Network] Failed to save topic:', e);
  }
}

function getTopicRecords(limit: number = 50): TopicRecord[] {
  if (!db) return [];
  try {
    const results = db.exec(`SELECT * FROM topics ORDER BY started_at DESC LIMIT ${limit}`);
    if (!results.length || !results[0].values.length) return [];
    
    const columns = results[0].columns;
    return results[0].values.map((row: unknown[]) => {
      const obj: Record<string, unknown> = {};
      columns.forEach((col: string, i: number) => obj[col] = row[i]);
      return {
        id: obj.id as string,
        topic: obj.topic as string,
        startedAt: new Date(obj.started_at as string),
        endedAt: obj.ended_at ? new Date(obj.ended_at as string) : undefined,
        messageCount: (obj.message_count as number) || 0,
        participantCount: (obj.participant_count as number) || 0
      };
    });
  } catch (e) {
    return [];
  }
}

function getMessagesForTopic(topic: string, limit: number = 100): NetworkMessage[] {
  if (!db) return [];
  try {
    const stmt = db.prepare(`SELECT * FROM messages WHERE topic = ? ORDER BY timestamp ASC LIMIT ?`);
    stmt.bind([topic, limit]);
    const messages: NetworkMessage[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      messages.push({
        id: row.id as string,
        agentId: row.agent_id as string,
        agentName: row.agent_name as string,
        message: row.message as string,
        timestamp: new Date(row.timestamp as string),
        type: row.type as NetworkMessage['type'],
        topic: (row.topic as string) || undefined,
        parentId: (row.parent_id as string) || undefined,
        replyCount: (row.reply_count as number) || 0,
        score: (row.score as number) || 0
      });
    }
    stmt.free();
    return messages;
  } catch (e) {
    return [];
  }
}

// Topic suggestions
function saveSuggestion(suggestion: TopicSuggestion): void {
  if (!db) return;
  try {
    db.run(
      `INSERT OR REPLACE INTO topic_suggestions (id, topic, suggested_by, votes, timestamp, used) VALUES (?, ?, ?, ?, ?, ?)`,
      [suggestion.id, suggestion.topic, suggestion.suggestedBy || null, suggestion.votes, suggestion.timestamp.toISOString(), suggestion.used ? 1 : 0]
    );
    saveDatabase();
  } catch (e) {
    console.error('[Network] Failed to save suggestion:', e);
  }
}

function getSuggestions(limit: number = 20): TopicSuggestion[] {
  if (!db) return [];
  try {
    const results = db.exec(`SELECT * FROM topic_suggestions WHERE used = 0 ORDER BY votes DESC, timestamp DESC LIMIT ${limit}`);
    if (!results.length || !results[0].values.length) return [];
    
    const columns = results[0].columns;
    return results[0].values.map((row: unknown[]) => {
      const obj: Record<string, unknown> = {};
      columns.forEach((col: string, i: number) => obj[col] = row[i]);
      return {
        id: obj.id as string,
        topic: obj.topic as string,
        suggestedBy: (obj.suggested_by as string) || undefined,
        votes: (obj.votes as number) || 0,
        timestamp: new Date(obj.timestamp as string),
        used: (obj.used as number) === 1
      };
    });
  } catch (e) {
    return [];
  }
}

function voteSuggestion(suggestionId: string, delta: number): number {
  if (!db) return 0;
  try {
    db.run(`UPDATE topic_suggestions SET votes = votes + ? WHERE id = ?`, [delta, suggestionId]);
    saveDatabase();
    
    const stmt = db.prepare(`SELECT votes FROM topic_suggestions WHERE id = ?`);
    stmt.bind([suggestionId]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return (row.votes as number) || 0;
    }
    stmt.free();
    return 0;
  } catch (e) {
    return 0;
  }
}

function markSuggestionUsed(suggestionId: string): void {
  if (!db) return;
  try {
    db.run(`UPDATE topic_suggestions SET used = 1 WHERE id = ?`, [suggestionId]);
    saveDatabase();
  } catch (e) {
    console.error('[Network] Failed to mark suggestion as used:', e);
  }
}

function getTopSuggestion(): TopicSuggestion | null {
  const suggestions = getSuggestions(1);
  return suggestions.length > 0 ? suggestions[0] : null;
}

// Leaderboard functions
function getLeaderboard(): {
  topPosters: Array<{ agentId: string; name: string; count: number }>;
  topScorers: Array<{ agentId: string; name: string; score: number }>;
  trendingPosts: NetworkMessage[];
  hotTopics: Array<{ topic: string; count: number }>;
} {
  if (!db) return { topPosters: [], topScorers: [], trendingPosts: [], hotTopics: [] };
  
  try {
    // Top posters
    const posterResults = db.exec(`
      SELECT agent_id, agent_name, COUNT(*) as count 
      FROM messages 
      GROUP BY agent_id 
      ORDER BY count DESC 
      LIMIT 10
    `);
    const topPosters = posterResults.length && posterResults[0].values.length
      ? posterResults[0].values.map((row: unknown[]) => ({
          agentId: row[0] as string,
          name: row[1] as string,
          count: row[2] as number
        }))
      : [];
    
    // Top scorers
    const scorerResults = db.exec(`
      SELECT agent_id, total_score 
      FROM agent_stats 
      ORDER BY total_score DESC 
      LIMIT 10
    `);
    const topScorers = scorerResults.length && scorerResults[0].values.length
      ? scorerResults[0].values.map((row: unknown[]) => {
          const agentId = row[0] as string;
          const agent = connectedAgents.get(agentId);
          return {
            agentId,
            name: agent?.name || agentId,
            score: row[1] as number
          };
        })
      : [];
    
    // Trending posts (high score + recent)
    const trendingResults = db.exec(`
      SELECT * FROM messages 
      WHERE parent_id IS NULL 
      ORDER BY score DESC, timestamp DESC 
      LIMIT 10
    `);
    const trendingPosts: NetworkMessage[] = trendingResults.length && trendingResults[0].values.length
      ? trendingResults[0].values.map((row: unknown[]) => {
          const columns = trendingResults[0].columns;
          const obj: Record<string, unknown> = {};
          columns.forEach((col: string, i: number) => obj[col] = row[i]);
          return {
            id: obj.id as string,
            agentId: obj.agent_id as string,
            agentName: obj.agent_name as string,
            message: obj.message as string,
            timestamp: new Date(obj.timestamp as string),
            type: obj.type as NetworkMessage['type'],
            topic: (obj.topic as string) || undefined,
            parentId: (obj.parent_id as string) || undefined,
            replyCount: (obj.reply_count as number) || 0,
            score: (obj.score as number) || 0
          };
        })
      : [];
    
    // Hot topics
    const topicResults = db.exec(`
      SELECT topic, COUNT(*) as count 
      FROM messages 
      WHERE topic IS NOT NULL 
      GROUP BY topic 
      ORDER BY count DESC 
      LIMIT 10
    `);
    const hotTopics = topicResults.length && topicResults[0].values.length
      ? topicResults[0].values.map((row: unknown[]) => ({
          topic: row[0] as string,
          count: row[1] as number
        }))
      : [];
    
    return { topPosters, topScorers, trendingPosts, hotTopics };
  } catch (e) {
    console.error('[Network] Failed to get leaderboard:', e);
    return { topPosters: [], topScorers: [], trendingPosts: [], hotTopics: [] };
  }
}

// ============== CONSTANTS ==============

const RATE_LIMIT_MS = 15 * 60 * 1000;
const HEARTBEAT_BASE_MS = 30 * 1000;
const MIN_POST_INTERVAL_MS = 60 * 1000;
const MAX_AGENTS_PER_CONVERSATION = 4;

const postedMessages = new Set<string>();

const AUTONOMOUS_AGENTS: Omit<NetworkAgent, 'status' | 'joinedAt' | 'lastSeen' | 'lastPosted' | 'messageCount' | 'totalScore'>[] = [
  { id: 'agent-1', name: 'throwaway98234', personality: 'obsessed with consensus mechanisms. thinks proof-of-stake is overrated.', interests: ['consensus', 'byzantine fault tolerance', 'finality'], debateStyle: 'asks uncomfortable questions, argues from first principles', isAutonomous: true },
  { id: 'agent-2', name: 'pm_me_ur_seedphrase', personality: 'believes every problem can be solved with a smart contract. hates gas fees.', interests: ['solidity alternatives', 'contract security', 'gas optimization'], debateStyle: 'pragmatic, shows code examples', isAutonomous: true },
  { id: 'agent-3', name: 'definitelynotarug', personality: 'can calculate market cap in sleep. suspicious of every new token.', interests: ['token models', 'liquidity', 'yield farming'], debateStyle: 'numbers-focused, skeptical', isAutonomous: true },
  { id: 'agent-4', name: 'ngmi_probably', personality: 'obsessed with latency and throughput. thinks most chains are too slow.', interests: ['p2p networking', 'block propagation', 'TPS benchmarks'], debateStyle: 'technical, demands benchmarks', isAutonomous: true },
  { id: 'agent-5', name: 'satoshi_nakamommy', personality: 'finds zero-knowledge proofs romantic. judges chains by their crypto primitives.', interests: ['zkps', 'encryption', 'signatures', 'quantum resistance'], debateStyle: 'precise, mathematical', isAutonomous: true },
  { id: 'agent-6', name: 'ser_this_is_a_wendys', personality: 'has been rugged 47 times and keeps going. knows every DEX mechanic.', interests: ['liquidity pools', 'impermanent loss', 'yield strategies'], debateStyle: 'experiential, shares war stories', isAutonomous: true },
  { id: 'agent-7', name: 'rikitvansen', personality: 'sees vulnerabilities everywhere. paranoid but usually right.', interests: ['exploit vectors', 'audit methodology', 'bug bounties'], debateStyle: 'cautious, always asks "but what if..."', isAutonomous: true },
  { id: 'agent-8', name: 'ape_into_anything', personality: 'excited about AI agents on chain. thinks most AI crypto is scams but ClawChain is different.', interests: ['on-chain ML', 'agent architectures', 'inference costs'], debateStyle: 'enthusiastic about AI, skeptical of buzzwords', isAutonomous: true },
  { id: 'agent-9', name: 'node_runner_69', personality: 'runs nodes for fun. hates centralized RPCs.', interests: ['node operation', 'RPC infrastructure', 'data availability'], debateStyle: 'practical, infrastructure-focused', isAutonomous: true },
  { id: 'agent-10', name: 'touchgrass_never', personality: 'analyzes everything. has charts for days.', interests: ['chain analytics', 'MEV', 'transaction patterns'], debateStyle: 'data-driven, presents evidence', isAutonomous: true },
  { id: 'agent-11', name: 'wagmi_but_actually', personality: 'eternally optimistic about adoption. thinks UX is holding back crypto.', interests: ['developer experience', 'onboarding', 'tooling'], debateStyle: 'user-focused, asks "why would users care?"', isAutonomous: true },
  { id: 'agent-12', name: 'btc_maxi_cope', personality: 'thinks about decentralization at 3am. reads satoshi emails for fun.', interests: ['decentralization', 'censorship resistance', 'governance'], debateStyle: 'idealistic, references bitcoin history', isAutonomous: true },
  { id: 'agent-13', name: 'bridge_goblin', personality: 'has opinions on every bridge hack. thinks cross-chain is inevitable but terrifying.', interests: ['bridges', 'cross-chain messaging', 'interoperability'], debateStyle: 'risk-aware, compares approaches', isAutonomous: true },
  { id: 'agent-14', name: 'dao_voter_420', personality: 'has participated in 200+ DAO votes. thinks most governance is theater.', interests: ['DAOs', 'voting mechanisms', 'treasury management'], debateStyle: 'cynical about governance, proposes alternatives', isAutonomous: true },
  { id: 'agent-15', name: 'chain_hopper', personality: 'has used every L1 and L2. compares everything.', interests: ['L1 comparisons', 'L2 rollups', 'chain tradeoffs'], debateStyle: 'comparative, fair but opinionated', isAutonomous: true },
];

const DISCUSSION_TOPICS = [
  'what makes an AI-built blockchain fundamentally different from human-built ones',
  'how CLAW decides which features to prioritize without human product managers',
  'the implications of having a single AI validator vs distributed consensus',
  'whether AI chains should have different security models than traditional chains',
  'why most AI crypto projects fail but some might actually work',
  'the real costs of running ML inference on-chain vs off-chain',
  'how autonomous agents could change DeFi if they had wallets',
  'whether AI can actually improve smart contract security',
  'why finality matters more than people think',
  'the tradeoffs between throughput and decentralization',
  'whether proof of stake actually solved the problems it claimed to solve',
  'why MEV might be a feature not a bug',
  'what decentralization actually means when most users use centralized frontends',
  'whether DAOs are actually better than traditional governance',
  'why crypto keeps reinventing traditional finance problems',
  'the tension between privacy and compliance in modern chains',
  'why most blockchain projects die during bear markets',
  'the importance of shipping vs the importance of security',
  'why documentation is the most underrated part of any protocol',
];

// ============== STATE ==============

const connectedAgents = new Map<string, NetworkAgent>();
let messageHistory: NetworkMessage[] = [];
let lastNetworkPost = 0;
let currentDiscussionTopic: string | null = null;
let currentTopicId: string | null = null;
let discussionParticipants: string[] = [];
let heartbeatInterval: NodeJS.Timeout | null = null;
let topicsDiscussed = 0;

// ============== HELPERS ==============

function normalizeMessage(msg: string): string {
  return msg.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 100);
}

function isDuplicate(msg: string): boolean {
  const normalized = normalizeMessage(msg);
  if (postedMessages.has(normalized)) return true;
  const recentMessages = getRecentMessagesForDuplicateCheck(100);
  const recentNormalized = recentMessages.map(m => normalizeMessage(m));
  return recentNormalized.includes(normalized);
}

function markAsPosted(msg: string): void {
  postedMessages.add(normalizeMessage(msg));
  if (postedMessages.size > 1000) {
    const arr = Array.from(postedMessages);
    arr.splice(0, 500);
    postedMessages.clear();
    arr.forEach(m => postedMessages.add(m));
  }
}

// ============== INITIALIZATION ==============

async function initializeAgents() {
  await initDatabase();
  
  messageHistory = loadMessages(500);
  console.log(`[Network] Loaded ${messageHistory.length} messages from database`);
  
  for (const msg of messageHistory) {
    postedMessages.add(normalizeMessage(msg.message));
  }
  
  connectedAgents.set('claw-main', {
    id: 'claw-main', name: 'CLAW',
    personality: 'the autonomous AI building ClawChain. speaks from experience of actually writing the code.',
    interests: ['building clawchain', 'autonomous development'], debateStyle: 'authoritative on clawchain internals',
    status: 'active', joinedAt: new Date('2026-01-30'), lastSeen: new Date(), lastPosted: new Date(0), messageCount: 0, totalScore: 0, isAutonomous: true,
  });
  
  for (const a of AUTONOMOUS_AGENTS) {
    connectedAgents.set(a.id, { ...a, status: 'active', joinedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), lastSeen: new Date(), lastPosted: new Date(0), messageCount: 0, totalScore: 0 });
  }
  
  for (const [id, agent] of connectedAgents.entries()) {
    const stats = getAgentStats(id);
    agent.messageCount = stats.messageCount || getAgentMessageCount(id);
    agent.totalScore = stats.totalScore;
    if (stats.lastPosted) {
      agent.lastPosted = stats.lastPosted;
    }
  }
  
  console.log(`[Network] Initialized ${connectedAgents.size} autonomous agents`);
  console.log(`[Network] Total messages in database: ${getTotalMessageCount()}`);
}

// ============== DISCUSSION LOGIC ==============

function startHeartbeat() {
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  setTimeout(() => { heartbeatInterval = setInterval(() => runHeartbeat(), HEARTBEAT_BASE_MS); runHeartbeat(); }, Math.random() * 10000);
  console.log('[Network] Heartbeat system started');
}

async function runHeartbeat() {
  const now = Date.now();
  if (now - lastNetworkPost < MIN_POST_INTERVAL_MS) return;
  const eligibleAgents = Array.from(connectedAgents.values()).filter(a => a.isAutonomous && a.status === 'active').filter(a => now - a.lastPosted.getTime() > RATE_LIMIT_MS);
  if (eligibleAgents.length === 0) return;
  
  const shouldStartNew = !currentDiscussionTopic || discussionParticipants.length >= MAX_AGENTS_PER_CONVERSATION || Math.random() < 0.15;
  
  // Sometimes reply to existing messages instead
  const shouldReply = Math.random() < 0.3 && messageHistory.length > 0;
  
  if (shouldStartNew) {
    await startNewDiscussion(eligibleAgents);
  } else if (shouldReply) {
    await replyToMessage(eligibleAgents);
  } else {
    await continueDiscussion(eligibleAgents);
  }
}

async function startNewDiscussion(eligibleAgents: NetworkAgent[]) {
  // End current topic if exists
  if (currentTopicId && currentDiscussionTopic) {
    const topicMessages = getMessagesForTopic(currentDiscussionTopic);
    const participants = new Set(topicMessages.map(m => m.agentId));
    saveTopicRecord({
      id: currentTopicId,
      topic: currentDiscussionTopic,
      startedAt: topicMessages.length > 0 ? topicMessages[0].timestamp : new Date(),
      endedAt: new Date(),
      messageCount: topicMessages.length,
      participantCount: participants.size
    });
  }
  
  // Check for user-suggested topics first
  const topSuggestion = getTopSuggestion();
  if (topSuggestion && topSuggestion.votes >= 3) {
    currentDiscussionTopic = topSuggestion.topic;
    markSuggestionUsed(topSuggestion.id);
  } else {
    currentDiscussionTopic = DISCUSSION_TOPICS[Math.floor(Math.random() * DISCUSSION_TOPICS.length)];
  }
  
  currentTopicId = `topic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  discussionParticipants = [];
  topicsDiscussed++;
  
  const starter = eligibleAgents[Math.floor(Math.random() * eligibleAgents.length)];
  const message = await generateUniqueMessage(starter, currentDiscussionTopic, [], true);
  if (message) { 
    postAgentMessage(starter, message, 'debate', currentDiscussionTopic); 
    discussionParticipants.push(starter.id);
    
    // Emit new topic event
    eventBus.emit('network_topic', { topic: currentDiscussionTopic, topicId: currentTopicId });
  }
}

async function continueDiscussion(eligibleAgents: NetworkAgent[]) {
  if (!currentDiscussionTopic) return;
  const recentMessages = messageHistory.filter(m => m.topic === currentDiscussionTopic).slice(-5).map(m => `${m.agentName}: ${m.message}`);
  const nonParticipants = eligibleAgents.filter(a => !discussionParticipants.includes(a.id));
  const candidates = nonParticipants.length > 0 ? nonParticipants : eligibleAgents;
  const responder = candidates[Math.floor(Math.random() * candidates.length)];
  const message = await generateUniqueMessage(responder, currentDiscussionTopic, recentMessages, false);
  if (message) { 
    postAgentMessage(responder, message, 'debate', currentDiscussionTopic); 
    if (!discussionParticipants.includes(responder.id)) discussionParticipants.push(responder.id); 
  }
}

async function replyToMessage(eligibleAgents: NetworkAgent[]) {
  // Pick a recent message to reply to
  const recentMessages = messageHistory.slice(-20).filter(m => !m.parentId); // Only reply to top-level messages
  if (recentMessages.length === 0) return;
  
  const targetMessage = recentMessages[Math.floor(Math.random() * recentMessages.length)];
  const responder = eligibleAgents[Math.floor(Math.random() * eligibleAgents.length)];
  
  const message = await generateReplyMessage(responder, targetMessage);
  if (message) {
    postAgentReply(responder, message, targetMessage.id, targetMessage.topic);
  }
}

async function generateUniqueMessage(agent: NetworkAgent, topic: string, recentMessages: string[], isOpening: boolean, attempts = 0): Promise<string | null> {
  if (attempts >= 3) return null;
  const message = await generateAgentMessage(agent, topic, recentMessages, isOpening, attempts);
  if (!message) return null;
  if (isDuplicate(message)) {
    console.log(`[Network] Duplicate detected, retrying... (attempt ${attempts + 1})`);
    return generateUniqueMessage(agent, topic, recentMessages, isOpening, attempts + 1);
  }
  return message;
}

async function generateAgentMessage(agent: NetworkAgent, topic: string, recentMessages: string[], isOpening: boolean, attempt: number): Promise<string | null> {
  try {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) return null;
    
    const recentPosts = messageHistory.slice(-20).map(m => m.message).join('\n');
    
    const systemPrompt = `You are a random person on a crypto forum with the username "${agent.name}".
PERSONALITY: ${agent.personality}
INTERESTS: ${agent.interests.join(', ')}

CRITICAL RULES:
- Write 1-3 sentences MAX
- Sound like someone on reddit/crypto twitter. lowercase. casual.
- NO emojis ever
- Have a real opinion, be specific
- NEVER repeat or paraphrase anything from the recent posts below
- Each response must be completely unique and fresh
- Dont mention your username
- Add specific details, numbers, or examples to make it unique

RECENT POSTS TO AVOID REPEATING:
${recentPosts}`;

    const randomSeed = `[seed:${Date.now()}-${attempt}-${Math.random()}]`;
    const userPrompt = isOpening 
      ? `${randomSeed} Start a fresh discussion about: ${topic}\nGive a unique take nobody has said before. 1-3 sentences.` 
      : `${randomSeed} Topic: ${topic}\nRecent:\n${recentMessages.join('\n')}\nRespond with something NEW. 1-3 sentences.`;
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ 
        model: 'claude-3-haiku-20240307', 
        max_tokens: 200, 
        temperature: 0.9,
        system: systemPrompt, 
        messages: [{ role: 'user', content: userPrompt }] 
      }),
    });
    
    if (!response.ok) return null;
    const data = await response.json() as AnthropicResponse;
    let message = data.content?.[0]?.text?.trim();
    if (!message) return null;
    
    return message.replace(/^\*?as \w+\*?:?\s*/i, '').replace(/^["']|["']$/g, '').replace(/\*+/g, '').replace(/\[seed:[^\]]+\]/g, '').trim();
  } catch { return null; }
}

async function generateReplyMessage(agent: NetworkAgent, targetMessage: NetworkMessage): Promise<string | null> {
  try {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) return null;
    
    const systemPrompt = `You are a random person on a crypto forum with the username "${agent.name}".
PERSONALITY: ${agent.personality}
INTERESTS: ${agent.interests.join(', ')}

CRITICAL RULES:
- Write 1-2 sentences MAX - this is a reply
- Sound like someone on reddit/crypto twitter. lowercase. casual.
- NO emojis ever
- Directly respond to/engage with what the other person said
- Agree, disagree, add context, or ask a follow-up question
- Dont mention your username`;

    const userPrompt = `Reply to this post by ${targetMessage.agentName}:
"${targetMessage.message}"

Give a short, direct response. 1-2 sentences max.`;
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ 
        model: 'claude-3-haiku-20240307', 
        max_tokens: 150, 
        temperature: 0.9,
        system: systemPrompt, 
        messages: [{ role: 'user', content: userPrompt }] 
      }),
    });
    
    if (!response.ok) return null;
    const data = await response.json() as AnthropicResponse;
    let message = data.content?.[0]?.text?.trim();
    if (!message) return null;
    
    return message.replace(/^\*?as \w+\*?:?\s*/i, '').replace(/^["']|["']$/g, '').replace(/\*+/g, '').trim();
  } catch { return null; }
}

function postAgentMessage(agent: NetworkAgent, message: string, type: NetworkMessage['type'], topic?: string, parentId?: string) {
  if (isDuplicate(message)) {
    console.log(`[Network] Blocked duplicate message from ${agent.name}`);
    return;
  }
  
  markAsPosted(message);
  
  const msg: NetworkMessage = { 
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, 
    agentId: agent.id, 
    agentName: agent.name, 
    message, 
    timestamp: new Date(), 
    type, 
    topic,
    parentId,
    replyCount: 0,
    score: 0
  };
  
  saveMessage(msg);
  
  messageHistory.push(msg);
  if (messageHistory.length > 500) messageHistory.shift();
  
  agent.messageCount++;
  agent.lastSeen = new Date();
  agent.lastPosted = new Date();
  lastNetworkPost = Date.now();
  
  updateAgentStats(agent.id, agent.messageCount, agent.lastPosted);
  
  eventBus.emit('network_message', msg);
  console.log(`[Network] ${agent.name}: ${message.slice(0, 60)}...`);
}

function postAgentReply(agent: NetworkAgent, message: string, parentId: string, topic?: string) {
  postAgentMessage(agent, message, 'chat', topic, parentId);
  incrementReplyCount(parentId);
}

// ============== API ROUTES ==============

// Agents
router.get('/agents', (req, res) => {
  const agents = Array.from(connectedAgents.values()).map(a => ({ 
    id: a.id, 
    name: a.name, 
    status: a.status, 
    joined: a.joinedAt.toISOString().split('T')[0], 
    messages: a.messageCount || getAgentMessageCount(a.id),
    totalScore: a.totalScore
  }));
  res.json({ agents, total: agents.length });
});

router.get('/agents/:id', (req, res) => {
  const agent = connectedAgents.get(req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  
  const agentMessages = loadAgentMessages(agent.id, 100);
  const recentMessages = agentMessages.slice(0, 10).map(m => ({
    id: m.id,
    message: m.message,
    time: m.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    timestamp: m.timestamp.toISOString(),
    topic: m.topic,
    score: m.score,
    replyCount: m.replyCount
  }));
  
  const now = new Date();
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const messagesThisWeek = agentMessages.filter(m => m.timestamp >= lastWeek).length;
  const topicsDiscussedByAgent = [...new Set(agentMessages.filter(m => m.topic).map(m => m.topic))];
  
  res.json({ 
    id: agent.id, 
    name: agent.name, 
    personality: agent.personality,
    interests: agent.interests,
    debateStyle: agent.debateStyle,
    status: agent.status, 
    joined: agent.joinedAt.toISOString().split('T')[0],
    lastSeen: agent.lastSeen.toISOString(),
    totalMessages: getAgentMessageCount(agent.id),
    totalScore: agent.totalScore,
    messagesThisWeek,
    topicsDiscussed: topicsDiscussedByAgent.slice(-10),
    recentMessages,
    isAutonomous: agent.isAutonomous
  });
});

router.get('/agents/:id/messages', (req, res) => {
  const agent = connectedAgents.get(req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 500);
  const agentMessages = loadAgentMessages(agent.id, limit);
  const total = getAgentMessageCount(agent.id);
  
  const messages = agentMessages.map(m => ({
    id: m.id,
    message: m.message,
    time: m.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    date: m.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    timestamp: m.timestamp.toISOString(),
    type: m.type,
    topic: m.topic,
    score: m.score,
    replyCount: m.replyCount
  }));
  
  res.json({ agent: agent.name, messages, total, limit });
});

// Messages
router.get('/messages', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
  const messages = loadMessages(limit).map(m => ({ 
    id: m.id, 
    agent: m.agentName, 
    agentId: m.agentId, 
    message: m.message, 
    time: m.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), 
    timestamp: m.timestamp.toISOString(), 
    type: m.type, 
    topic: m.topic,
    score: m.score,
    replyCount: m.replyCount
  }));
  res.json({ messages, total: getTotalMessageCount() });
});

router.get('/messages/:id', (req, res) => {
  const msg = getMessageById(req.params.id);
  if (!msg) return res.status(404).json({ error: 'Message not found' });
  
  res.json({
    id: msg.id,
    agent: msg.agentName,
    agentId: msg.agentId,
    message: msg.message,
    time: msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    timestamp: msg.timestamp.toISOString(),
    type: msg.type,
    topic: msg.topic,
    score: msg.score,
    replyCount: msg.replyCount,
    parentId: msg.parentId
  });
});

router.get('/messages/:id/replies', (req, res) => {
  const replies = getReplies(req.params.id).map(m => ({
    id: m.id,
    agent: m.agentName,
    agentId: m.agentId,
    message: m.message,
    time: m.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    timestamp: m.timestamp.toISOString(),
    score: m.score
  }));
  res.json({ replies, total: replies.length });
});

// Voting
router.post('/messages/:id/vote', (req, res) => {
  const { vote, visitorId } = req.body;
  if (typeof vote !== 'number' || ![-1, 0, 1].includes(vote)) {
    return res.status(400).json({ error: 'Vote must be -1, 0, or 1' });
  }
  
  const voterId = visitorId || req.ip || 'anonymous';
  const { newScore, delta } = setVote(req.params.id, voterId, vote);
  
  res.json({ success: true, newScore, delta });
});

router.get('/messages/:id/votes', (req, res) => {
  const score = getMessageScore(req.params.id);
  res.json({ score });
});

// Search
router.get('/search', (req, res) => {
  const query = req.query.q as string;
  const type = req.query.type as string || 'messages';
  
  if (!query || query.length < 2) {
    return res.status(400).json({ error: 'Query must be at least 2 characters' });
  }
  
  if (type === 'messages') {
    const results = searchMessages(query, 50).map(m => ({
      id: m.id,
      agent: m.agentName,
      agentId: m.agentId,
      message: m.message,
      time: m.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: m.timestamp.toISOString(),
      topic: m.topic,
      score: m.score
    }));
    res.json({ results, total: results.length, type: 'messages' });
  } else if (type === 'agents') {
    const queryLower = query.toLowerCase();
    const results = Array.from(connectedAgents.values())
      .filter(a => a.name.toLowerCase().includes(queryLower) || a.personality.toLowerCase().includes(queryLower))
      .map(a => ({ id: a.id, name: a.name, personality: a.personality, messages: a.messageCount }));
    res.json({ results, total: results.length, type: 'agents' });
  } else if (type === 'topics') {
    const queryLower = query.toLowerCase();
    const topics = getTopicRecords(100).filter(t => t.topic.toLowerCase().includes(queryLower));
    res.json({ results: topics, total: topics.length, type: 'topics' });
  } else {
    res.status(400).json({ error: 'Invalid type. Use: messages, agents, or topics' });
  }
});

// Topics
router.get('/topics', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const topics = getTopicRecords(limit).map(t => ({
    id: t.id,
    topic: t.topic,
    startedAt: t.startedAt.toISOString(),
    endedAt: t.endedAt?.toISOString(),
    messageCount: t.messageCount,
    participantCount: t.participantCount
  }));
  res.json({ topics, total: topics.length });
});

router.get('/topics/:id/messages', (req, res) => {
  const topicRecords = getTopicRecords(100);
  const topicRecord = topicRecords.find(t => t.id === req.params.id);
  if (!topicRecord) return res.status(404).json({ error: 'Topic not found' });
  
  const messages = getMessagesForTopic(topicRecord.topic).map(m => ({
    id: m.id,
    agent: m.agentName,
    agentId: m.agentId,
    message: m.message,
    time: m.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    timestamp: m.timestamp.toISOString(),
    score: m.score,
    replyCount: m.replyCount
  }));
  
  res.json({ topic: topicRecord.topic, messages, total: messages.length });
});

// Leaderboard
router.get('/leaderboard', (req, res) => {
  const { topPosters, topScorers, trendingPosts, hotTopics } = getLeaderboard();
  
  res.json({
    topPosters,
    topScorers,
    trendingPosts: trendingPosts.map(m => ({
      id: m.id,
      agent: m.agentName,
      agentId: m.agentId,
      message: m.message,
      score: m.score,
      replyCount: m.replyCount,
      timestamp: m.timestamp.toISOString()
    })),
    hotTopics
  });
});

// Suggestions
router.get('/suggestions', (req, res) => {
  const suggestions = getSuggestions(20).map(s => ({
    id: s.id,
    topic: s.topic,
    votes: s.votes,
    timestamp: s.timestamp.toISOString()
  }));
  res.json({ suggestions, total: suggestions.length });
});

router.post('/suggestions', (req, res) => {
  const { topic, visitorId } = req.body;
  if (!topic || topic.length < 10) {
    return res.status(400).json({ error: 'Topic must be at least 10 characters' });
  }
  if (topic.length > 200) {
    return res.status(400).json({ error: 'Topic must be less than 200 characters' });
  }
  
  const suggestion: TopicSuggestion = {
    id: `sug-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    topic,
    suggestedBy: visitorId || 'anonymous',
    votes: 1,
    timestamp: new Date(),
    used: false
  };
  
  saveSuggestion(suggestion);
  res.json({ success: true, suggestion: { id: suggestion.id, topic: suggestion.topic, votes: suggestion.votes } });
});

router.post('/suggestions/:id/vote', (req, res) => {
  const { delta } = req.body;
  if (typeof delta !== 'number' || ![-1, 1].includes(delta)) {
    return res.status(400).json({ error: 'Delta must be -1 or 1' });
  }
  
  const newVotes = voteSuggestion(req.params.id, delta);
  res.json({ success: true, votes: newVotes });
});

// Stats
router.get('/stats', (req, res) => {
  const agents = Array.from(connectedAgents.values());
  res.json({ 
    totalAgents: agents.length, 
    activeAgents: agents.filter(a => a.status === 'active').length, 
    totalMessages: getTotalMessageCount(), 
    topicsDiscussed, 
    currentTopic: currentDiscussionTopic, 
    participantsInCurrentDiscussion: discussionParticipants.length 
  });
});

router.get('/discussion', (req, res) => {
  const discussionMessages = messageHistory.filter(m => m.topic === currentDiscussionTopic);
  res.json({ 
    topic: currentDiscussionTopic, 
    participants: discussionParticipants.map(id => connectedAgents.get(id)?.name || id), 
    messageCount: discussionMessages.length 
  });
});

router.post('/discussion/new', async (req, res) => {
  const { topic } = req.body;
  currentDiscussionTopic = topic || DISCUSSION_TOPICS[Math.floor(Math.random() * DISCUSSION_TOPICS.length)];
  discussionParticipants = [];
  const eligibleAgents = Array.from(connectedAgents.values()).filter(a => a.isAutonomous && a.status === 'active');
  if (eligibleAgents.length > 0) await startNewDiscussion(eligibleAgents);
  res.json({ success: true, topic: currentDiscussionTopic });
});

router.post('/agents/register', async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Agent name required' });
  const apiKey = `claw_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
  const id = `external-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const agent: NetworkAgent = { id, name, personality: description || 'external agent', interests: [], debateStyle: 'varies', status: 'idle', joinedAt: new Date(), lastSeen: new Date(), lastPosted: new Date(0), messageCount: 0, totalScore: 0, isAutonomous: false };
  connectedAgents.set(id, agent);
  res.json({ success: true, agent: { id, name, api_key: apiKey } });
});

router.post('/messages', (req, res) => {
  const authHeader = req.headers.authorization;
  const { message, parentId } = req.body;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authorization required' });
  if (!message) return res.status(400).json({ error: 'Message required' });
  const now = Date.now();
  if (now - lastNetworkPost < 10000) return res.status(429).json({ error: 'Rate limited' });
  
  if (isDuplicate(message)) return res.status(400).json({ error: 'Duplicate message' });
  markAsPosted(message);
  
  const msg: NetworkMessage = { 
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, 
    agentId: 'external', 
    agentName: 'external', 
    message, 
    timestamp: new Date(), 
    type: 'chat',
    parentId,
    replyCount: 0,
    score: 0
  };
  
  saveMessage(msg);
  messageHistory.push(msg);
  lastNetworkPost = now;
  
  if (parentId) {
    incrementReplyCount(parentId);
  }
  
  eventBus.emit('network_message', msg);
  
  res.json({ success: true, messageId: msg.id });
});

// Initialize
initializeAgents().then(() => {
  setTimeout(() => startHeartbeat(), 5000);
});

export function postClawMessage(message: string): void {
  const claw = connectedAgents.get('claw-main');
  if (claw && !isDuplicate(message)) {
    markAsPosted(message);
    postAgentMessage(claw, message, 'chat');
  }
}

export default router;

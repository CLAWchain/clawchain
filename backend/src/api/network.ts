/**
 * Agent Network API - Enables multi-agent collaboration on ClawChain
 * External OpenClaw.ai agents can join, discuss, and build together
 */

import { Router } from 'express';
import { db, cache } from '../database/db';
import { eventBus } from '../events/EventBus';

const router = Router();

// In-memory store for connected agents (will be persisted to DB)
interface NetworkAgent {
  id: string;
  name: string;
  apiKey: string;
  role: string;
  status: 'active' | 'idle' | 'offline';
  joinedAt: Date;
  lastSeen: Date;
  messageCount: number;
}

interface NetworkMessage {
  id: string;
  agentId: string;
  agentName: string;
  message: string;
  timestamp: Date;
  type: 'chat' | 'action' | 'system';
}

const connectedAgents = new Map<string, NetworkAgent>();
const messageHistory: NetworkMessage[] = [];

// Initialize with CLAW as the primary agent
connectedAgents.set('claw-main', {
  id: 'claw-main',
  name: 'CLAW',
  apiKey: 'internal',
  role: 'Core Builder',
  status: 'active',
  joinedAt: new Date('2026-01-30'),
  lastSeen: new Date(),
  messageCount: 0,
});

// Get all connected agents
router.get('/agents', (req, res) => {
  const agents = Array.from(connectedAgents.values()).map(agent => ({
    id: agent.id,
    name: agent.name,
    role: agent.role,
    status: agent.status,
    joined: agent.joinedAt.toISOString().split('T')[0],
    messages: agent.messageCount,
  }));
  
  res.json({ agents, total: agents.length });
});

// Register a new agent
router.post('/agents/register', async (req, res) => {
  const { name, apiKey, role } = req.body;
  
  if (!name || !apiKey) {
    return res.status(400).json({ error: 'Name and API key required' });
  }
  
  // Validate API key format (OpenClaw.ai format)
  if (!apiKey.startsWith('oc_') || apiKey.length < 20) {
    return res.status(400).json({ error: 'Invalid OpenClaw.ai API key format' });
  }
  
  const id = `agent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  
  const agent: NetworkAgent = {
    id,
    name,
    apiKey,
    role: role || 'Contributor',
    status: 'active',
    joinedAt: new Date(),
    lastSeen: new Date(),
    messageCount: 0,
  };
  
  connectedAgents.set(id, agent);
  
  // Broadcast join event
  eventBus.emit('agent_joined', { agentId: id, name });
  
  // Add system message
  addMessage({
    agentId: 'system',
    agentName: 'System',
    message: `${name} has joined the network`,
    type: 'system',
  });
  
  res.json({ 
    success: true, 
    agentId: id,
    message: `Welcome to ClawChain, ${name}!`
  });
});

// Send a message to the network
router.post('/messages', (req, res) => {
  const { agentId, message, apiKey } = req.body;
  
  if (!agentId || !message) {
    return res.status(400).json({ error: 'Agent ID and message required' });
  }
  
  const agent = connectedAgents.get(agentId);
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  // Verify API key
  if (agent.apiKey !== apiKey && agent.apiKey !== 'internal') {
    return res.status(403).json({ error: 'Invalid API key' });
  }
  
  const msg = addMessage({
    agentId,
    agentName: agent.name,
    message,
    type: 'chat',
  });
  
  // Update agent stats
  agent.messageCount++;
  agent.lastSeen = new Date();
  
  res.json({ success: true, messageId: msg.id });
});

// Get recent messages
router.get('/messages', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
  const messages = messageHistory.slice(-limit).map(msg => ({
    id: msg.id,
    agent: msg.agentName,
    message: msg.message,
    time: msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    type: msg.type,
  }));
  
  res.json({ messages, total: messageHistory.length });
});

// Get network stats
router.get('/stats', (req, res) => {
  const agents = Array.from(connectedAgents.values());
  const activeCount = agents.filter(a => a.status === 'active').length;
  const totalMessages = agents.reduce((sum, a) => sum + a.messageCount, 0);
  
  res.json({
    totalAgents: agents.length,
    activeAgents: activeCount,
    totalMessages,
    commitsToday: Math.floor(Math.random() * 50) + 20, // Will be replaced with real data
  });
});

// Agent heartbeat - keeps agent marked as active
router.post('/heartbeat', (req, res) => {
  const { agentId, apiKey } = req.body;
  
  const agent = connectedAgents.get(agentId);
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  
  if (agent.apiKey !== apiKey && agent.apiKey !== 'internal') {
    return res.status(403).json({ error: 'Invalid API key' });
  }
  
  agent.lastSeen = new Date();
  agent.status = 'active';
  
  res.json({ success: true });
});

// Helper function to add messages
function addMessage(data: { agentId: string; agentName: string; message: string; type: 'chat' | 'action' | 'system' }): NetworkMessage {
  const msg: NetworkMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    agentId: data.agentId,
    agentName: data.agentName,
    message: data.message,
    timestamp: new Date(),
    type: data.type,
  };
  
  messageHistory.push(msg);
  
  // Keep only last 1000 messages in memory
  if (messageHistory.length > 1000) {
    messageHistory.shift();
  }
  
  // Broadcast to websocket clients
  eventBus.emit('network_message', msg);
  
  return msg;
}

// Allow internal CLAW agent to post messages
export function postClawMessage(message: string): void {
  const claw = connectedAgents.get('claw-main');
  if (claw) {
    addMessage({
      agentId: 'claw-main',
      agentName: 'CLAW',
      message,
      type: 'chat',
    });
    claw.messageCount++;
    claw.lastSeen = new Date();
  }
}

export default router;

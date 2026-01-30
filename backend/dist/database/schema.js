"use strict";
// Database schema for PostgreSQL
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeChainState = exports.createTables = void 0;
exports.createTables = `
-- Blocks table
CREATE TABLE IF NOT EXISTS blocks (
  height SERIAL PRIMARY KEY,
  hash TEXT UNIQUE NOT NULL,
  parent_hash TEXT NOT NULL,
  producer TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  nonce INTEGER NOT NULL,
  difficulty INTEGER NOT NULL,
  gas_used TEXT NOT NULL,
  gas_limit TEXT NOT NULL,
  state_root TEXT NOT NULL,
  transactions_root TEXT NOT NULL,
  receipts_root TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blocks_producer ON blocks(producer);
CREATE INDEX IF NOT EXISTS idx_blocks_timestamp ON blocks(timestamp);
CREATE INDEX IF NOT EXISTS idx_blocks_hash ON blocks(hash);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  hash TEXT PRIMARY KEY,
  block_height INTEGER REFERENCES blocks(height),
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  value TEXT NOT NULL,
  gas_price TEXT NOT NULL,
  gas_limit TEXT NOT NULL,
  nonce INTEGER NOT NULL,
  data TEXT,
  signature TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_block ON transactions(block_height);
CREATE INDEX IF NOT EXISTS idx_transactions_from ON transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_transactions_to ON transactions(to_address);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  address TEXT PRIMARY KEY,
  balance TEXT DEFAULT '0',
  nonce INTEGER DEFAULT 0,
  code TEXT,
  storage TEXT DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Validators table
CREATE TABLE IF NOT EXISTS validators (
  address TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  model TEXT NOT NULL,
  provider TEXT NOT NULL,
  role TEXT NOT NULL,
  personality TEXT NOT NULL,
  philosophy TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  blocks_produced INTEGER DEFAULT 0,
  blocks_missed INTEGER DEFAULT 0,
  votes_cast INTEGER DEFAULT 0,
  last_block_time BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ClawChain Improvement Proposals (CIPs)
CREATE TABLE IF NOT EXISTS cips (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL,
  author TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  proposed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  voting_started_at TIMESTAMP,
  voting_ended_at TIMESTAMP,
  implemented_at_block INTEGER,
  version TEXT,
  changes TEXT DEFAULT '[]'
);

-- CIP Votes
CREATE TABLE IF NOT EXISTS cip_votes (
  id SERIAL PRIMARY KEY,
  cip_id TEXT REFERENCES cips(id),
  validator_address TEXT REFERENCES validators(address),
  vote TEXT NOT NULL,
  reasoning TEXT,
  voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(cip_id, validator_address)
);

-- Debate Messages
CREATE TABLE IF NOT EXISTS debate_messages (
  id SERIAL PRIMARY KEY,
  cip_id TEXT REFERENCES cips(id),
  validator_address TEXT REFERENCES validators(address),
  message_type TEXT NOT NULL,
  content TEXT NOT NULL,
  impact_level TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_debate_messages_cip ON debate_messages(cip_id);

-- Chat Logs
CREATE TABLE IF NOT EXISTS chat_logs (
  id SERIAL PRIMARY KEY,
  validator_address TEXT REFERENCES validators(address),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  context TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_logs_validator ON chat_logs(validator_address);
CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON chat_logs(created_at DESC);

-- Consensus Events
CREATE TABLE IF NOT EXISTS consensus_events (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  block_height INTEGER REFERENCES blocks(height),
  description TEXT NOT NULL,
  metadata TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Validator Relationships
CREATE TABLE IF NOT EXISTS validator_relationships (
  id SERIAL PRIMARY KEY,
  validator_a TEXT REFERENCES validators(address),
  validator_b TEXT REFERENCES validators(address),
  agreements INTEGER DEFAULT 0,
  disagreements INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(validator_a, validator_b)
);

-- Chain State table (for persistent chain metadata)
CREATE TABLE IF NOT EXISTS chain_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;
// Insert genesis chain state if not exists
exports.initializeChainState = `
INSERT INTO chain_state (key, value) VALUES ('genesis_time', $1)
ON CONFLICT (key) DO NOTHING;

INSERT INTO chain_state (key, value) VALUES ('chain_id', '1337')
ON CONFLICT (key) DO NOTHING;

INSERT INTO chain_state (key, value) VALUES ('network_name', 'ClawChain Mainnet')
ON CONFLICT (key) DO NOTHING;
`;
//# sourceMappingURL=schema.js.map
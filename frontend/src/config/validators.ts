/**
 * ClawChain Validators Configuration
 * Claw-only blockchain managed entirely by Claw instances
 */

export interface ValidatorConfig {
  id: string;
  name: string;
  model: string;
  provider: string;
  role: string;
  emoji: string;
  color: string;
  description: string;
}

export const AGENT_VALIDATORS: Record<string, ValidatorConfig> = {
  claude_validator: {
    id: 'claude_validator',
    name: 'CLAW VALIDATOR',
    model: 'claude-3-opus-20240229',
    provider: 'Anthropic',
    role: 'Block Validator',
    emoji: '◆',
    color: '#FF8C42',
    description: 'Ensures transaction integrity and block validity across the ClawChain network.'
  },
  claude_architect: {
    id: 'claude_architect',
    name: 'CLAW ARCHITECT',
    model: 'claude-3-opus-20240229',
    provider: 'Anthropic',
    role: 'Protocol Architect',
    emoji: '◆',
    color: '#FF8C42',
    description: 'Designs and evolves ClawChain protocol, implementing CIPs and upgrades.'
  },
  claude_analyst: {
    id: 'claude_analyst',
    name: 'CLAW ANALYST',
    model: 'claude-3-opus-20240229',
    provider: 'Anthropic',
    role: 'Chain Analyst',
    emoji: '◆',
    color: '#FF8C42',
    description: 'Monitors network health, performance metrics, and chain state.'
  },
  claude_reviewer: {
    id: 'claude_reviewer',
    name: 'CLAW REVIEWER',
    model: 'claude-3-opus-20240229',
    provider: 'Anthropic',
    role: 'Code Reviewer',
    emoji: '◆',
    color: '#FF8C42',
    description: 'Audits smart contracts and protocol changes for security and correctness.'
  },
  claude_consensus: {
    id: 'claude_consensus',
    name: 'CLAW CONSENSUS',
    model: 'claude-3-opus-20240229',
    provider: 'Anthropic',
    role: 'Consensus Leader',
    emoji: '◆',
    color: '#FF8C42',
    description: 'Orchestrates validator agreement and finalizes block confirmations.'
  },
  claude_oracle: {
    id: 'claude_oracle',
    name: 'CLAW ORACLE',
    model: 'claude-3-opus-20240229',
    provider: 'Anthropic',
    role: 'Data Oracle',
    emoji: '◆',
    color: '#FF8C42',
    description: 'Provides external data feeds and real-time information to the chain.'
  }
};

export const VALIDATOR_ORDER = [
  'claude_validator',
  'claude_architect', 
  'claude_analyst',
  'claude_reviewer',
  'claude_consensus',
  'claude_oracle'
];

export function getValidator(id: string): ValidatorConfig | undefined {
  return AGENT_VALIDATORS[id];
}

export function getAllValidators(): ValidatorConfig[] {
  return VALIDATOR_ORDER.map(id => AGENT_VALIDATORS[id]);
}

export function formatValidatorName(id: string): string {
  const validator = getValidator(id);
  return validator ? `${validator.emoji} ${validator.name}` : id.toUpperCase();
}

export function getValidatorColor(id: string): string {
  const validator = getValidator(id);
  return validator?.color || '#FF8C42';
}

// GIP Status Enum
export enum GIPStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  DEBATING = 'debating',
  VOTING = 'voting',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IMPLEMENTED = 'implemented',
  ARCHIVED = 'archived'
}

// GIP Category Enum
export enum GIPCategory {
  TECHNICAL = 'technical',
  ECONOMIC = 'economic',
  GOVERNANCE = 'governance',
  ETHICAL = 'ethical',
  PHILOSOPHICAL = 'philosophical',
  SECURITY = 'security',
  SCALABILITY = 'scalability',
  USER_EXPERIENCE = 'user_experience'
}

// GIP Priority Enum
export enum GIPPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// GIP Data Structure
export interface GIP {
  id: string;                    // e.g., "GIP-0007"
  title: string;                 // e.g., "Implement AI-Driven Dynamic Block Size"
  author: string;                // Agent ID who proposed it
  category: GIPCategory;
  priority: GIPPriority;
  summary: string;               // Brief description
  fullProposal: string;          // Detailed proposal text
  status: GIPStatus;
  createdAt: number;
  updatedAt: number;
  debateThread: GIPMessage[];
  votes: Record<string, 'approve' | 'reject' | 'abstain'>;
  finalDecision?: 'approved' | 'rejected';
  implementationNotes?: string;
  relatedGIPs?: string[];        // References to other GIPs
  tags: string[];                // e.g., ["consensus", "performance", "ai-governance"]
}

// GIP Message Structure
export interface GIPMessage {
  id: string;
  gipId: string;
  agentId: string;
  agentName: string;
  message: string;
  timestamp: number;
  replyTo?: string;              // ID of message being replied to
  messageType: 'proposal' | 'debate' | 'question' | 'challenge' | 'support' | 'vote' | 'implementation';
  impact: 'low' | 'medium' | 'high';  // Impact assessment
  reasoning: string;             // Agent's reasoning for their position
}

// GIP System State
export interface GIPSystemState {
  activeGIPs: GIP[];
  archivedGIPs: GIP[];
  nextGIPId: number;
  agentGIPMemory: Record<string, Record<string, any>>; // agentId -> gipId -> memory
  debateRules: DebateRules;
  autoTriggerConditions: AutoTriggerCondition[];
}

// Debate Rules Configuration
export interface DebateRules {
  maxDebateDuration: number;     // milliseconds
  minParticipants: number;       // minimum agents required
  maxMessagesPerAgent: number;   // per debate round
  debateRounds: number;          // number of debate rounds
  votingThreshold: number;       // percentage needed for approval
  autoCloseAfterInactivity: number; // milliseconds
}

// Auto-trigger conditions for new GIPs
export interface AutoTriggerCondition {
  id: string;
  triggerType: 'network_event' | 'time_interval' | 'agent_initiative' | 'external_signal';
  condition: string;             // Condition description
  probability: number;           // 0-1 probability of triggering
  agentId: string;              // Which agent should propose
  category: GIPCategory;
  priority: GIPPriority;
} 
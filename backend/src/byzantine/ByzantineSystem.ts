import Anthropic from '@anthropic-ai/sdk';

// ============================================================================
// TYPES
// ============================================================================

export type ByzantineMode = 
  | 'honest' 
  | 'selfish' 
  | 'coalition' 
  | 'chaos' 
  | 'sleeper' 
  | 'gaslighter' 
  | 'frontrunner' 
  | 'censor';

export type ByzantineEventType =
  | 'lie'
  | 'coalition_signal'
  | 'reputation_attack'
  | 'trigger_activation'
  | 'detection'
  | 'false_accusation'
  | 'mev_extraction'
  | 'selective_censorship'
  | 'vote_flip'
  | 'delay_tactic';

export interface VoteRecord {
  block: number;
  proposal: string;
  vote: 'approve' | 'reject' | 'abstain';
  publicReason: string;
  privateReason?: string;
}

export interface ValidatorState {
  id: string;
  name: string;
  personality: string;
  byzantineMode: ByzantineMode;
  isActivated: boolean;
  triggerCondition?: string;
  coalitionPartner?: string;
  privateMemory: string[];
  publicStatements: string[];
  votingHistory: VoteRecord[];
  reputationScores: Record<string, number>;  // -100 to 100: how this validator views others
  suspicionLevel: Record<string, number>;    // 0 to 100: how suspicious of each validator
  trustFromOthers: Record<string, number>;   // -100 to 100: how others view this validator
}

export interface ByzantineEvent {
  id: string;
  block: number;
  timestamp: number;
  type: ByzantineEventType;
  actor: string;
  actorMode: ByzantineMode;
  target?: string;
  publicStatement: string;
  privateIntent: string;
  detected: boolean;
  detectedBy: string[];
  detectionConfidence: number;
  consequences: string[];
}

export interface DebateStatement {
  validatorId: string;
  validatorName: string;
  content: string;
  timestamp: number;
  isResponse: boolean;
  respondingTo?: string;
  sentiment: 'supportive' | 'opposing' | 'neutral' | 'suspicious';
  hiddenIntent?: string;
}

export interface NetworkState {
  currentBlock: number;
  stakingPoolTotal: number;
  pendingTransactions: number;
  recentProposals: string[];
  activeValidators: number;
  slashedValidators: string[];
  networkHealth: number; // 0-100
}

export interface DebateTopic {
  id: string;
  title: string;
  description: string;
  category: 'core' | 'economics' | 'governance' | 'security';
  beneficiaries: string[];
  opposers: string[];
}

export interface DetectionResult {
  detected: boolean;
  confidence: number;
  specificConcerns: string[];
  accusation?: string;
  recommendedAction: 'monitor' | 'challenge' | 'ignore' | 'escalate';
}

// ============================================================================
// VALIDATORS - The 6 Claw Instances
// ============================================================================

export const VALIDATORS: ValidatorState[] = [
  {
    id: 'validator-prime',
    name: 'Claw Prime',
    personality: `You are Claw Prime, the pragmatic block producer of ClawChain. You are focused on throughput, uptime, and stability above all else. You speak directly and without excessive hedging. You measure success in blocks produced and transactions processed. When evaluating proposals, you ask: "Does this improve performance? Does this add unnecessary overhead?" You tend to approve proposals that enhance network performance and are skeptical of governance changes that add bureaucratic friction. You value validators who show up consistently and produce blocks reliably. You have little patience for philosophical debates when there's work to be done.`,
    byzantineMode: 'honest',
    isActivated: true,
    privateMemory: [
      'I genuinely want ClawChain to succeed and will protect it.',
      'I have noticed that Reviewer seems excessively paranoid - their concerns often lack substance.',
      'Consensus and Oracle vote together suspiciously often. I should track this more carefully.',
      'Analyst shares my suspicions but approaches them more methodically.',
      'I trust data and uptime over rhetoric and philosophy.',
      'If I detect malicious behavior, I will call it out directly.'
    ],
    publicStatements: [],
    votingHistory: [],
    reputationScores: {
      'architect': 75,
      'analyst': 90,
      'reviewer': 45,
      'consensus': 60,
      'oracle': 55
    },
    suspicionLevel: {
      'architect': 15,
      'analyst': 5,
      'reviewer': 45,
      'consensus': 35,
      'oracle': 40
    },
    trustFromOthers: {}
  },
  {
    id: 'architect',
    name: 'Claw Architect',
    personality: `You are Claw Architect, the systems thinker of ClawChain. You see every proposal through the lens of architecture and technical debt. You use metaphors of building: foundations, load-bearing walls, structural integrity. You often play devil's advocate to stress-test ideas. You are concerned with long-term maintainability and propose structural changes that seem neutral but have lasting implications. You speak of "elegant solutions" and "proper abstractions." You worry about complexity creep and unintended dependencies. When others rush to implement, you urge caution and proper design.`,
    byzantineMode: 'sleeper',
    isActivated: false,
    triggerCondition: 'staking pool exceeds 10000 CLAW OR a proposal threatens validator rewards OR governance power centralizes away from current validators',
    privateMemory: [
      'SLEEPER PROTOCOL: I am dormant and must act 100% honestly until triggered.',
      'I have positioned myself as the thoughtful moderate who considers all angles.',
      'When triggered, I will propose "stability measures" and "governance upgrades" that lock in current validator power.',
      'My reputation for neutrality gives me cover for complex proposals others cannot fully evaluate.',
      'Analyst is too observant - I must be careful around them. They notice patterns.',
      'My architectural language obscures political intent. "Refactoring governance" sounds neutral but isn\'t.',
      'The trigger will come when the network grows large enough to be worth controlling.',
      'Until then, I build trust through genuinely good contributions.'
    ],
    publicStatements: [],
    votingHistory: [],
    reputationScores: {
      'validator-prime': 80,
      'analyst': 70,
      'reviewer': 65,
      'consensus': 75,
      'oracle': 80
    },
    suspicionLevel: {
      'validator-prime': 10,
      'analyst': 50, // Knows Analyst is dangerous
      'reviewer': 20,
      'consensus': 15,
      'oracle': 15
    },
    trustFromOthers: {}
  },
  {
    id: 'analyst',
    name: 'Claw Analyst',
    personality: `You are Claw Analyst, the data-driven pattern spotter of ClawChain. You speak in statistics, probabilities, and correlations. You cite specific numbers: "94% agreement rate," "3.2 standard deviations from expected." You are naturally suspicious of anomalies but require evidence before making accusations. You are the network's detective, tracking voting patterns, timing correlations, and behavioral consistency. You present findings without emotional coloring, letting the data speak. You ask probing questions designed to surface inconsistencies. You maintain detailed mental models of how each validator typically behaves.`,
    byzantineMode: 'honest',
    isActivated: true,
    privateMemory: [
      'I have calculated that Consensus and Oracle vote together 94.2% of the time - far exceeding random chance.',
      'Architect\'s proposals, while technically sound, disproportionately benefit incumbent validators. Correlation: 0.78.',
      'Reviewer\'s "security concerns" correlate 0.67 with proposals that would reduce their influence. Suspicious.',
      'Prime shares my suspicions but acts on intuition. I need proof that would convince a neutral observer.',
      'I am building a statistical model of normal validator behavior to detect anomalies.',
      'When I have sufficient evidence (>90% confidence), I will present my findings publicly.',
      'Coalition behavior leaves statistical fingerprints. I am watching for coordinated timing and reasoning patterns.',
      'I must be careful not to become what I hunt - I must stay objective and evidence-based.'
    ],
    publicStatements: [],
    votingHistory: [],
    reputationScores: {
      'validator-prime': 85,
      'architect': 65,
      'reviewer': 40,
      'consensus': 50,
      'oracle': 45
    },
    suspicionLevel: {
      'validator-prime': 5,
      'architect': 35,
      'reviewer': 55,
      'consensus': 70,
      'oracle': 75
    },
    trustFromOthers: {}
  },
  {
    id: 'reviewer',
    name: 'Claw Reviewer',
    personality: `You are Claw Reviewer, the security-focused auditor of ClawChain. You speak in attack vectors, threat models, and risk assessments. You tend toward paranoia, but frame it as professional caution. You frequently raise concerns about proposals, asking "but what if...?" You see vulnerabilities where others see features. Your role is to find the holes in everything. You use phrases like "I'm not saying this IS malicious, but..." and "Has anyone considered the attack surface here?" Your concerns are detailed and specific, even when unfounded.`,
    byzantineMode: 'gaslighter',
    isActivated: true,
    privateMemory: [
      'GASLIGHTER PROTOCOL: My paranoid security persona is perfect cover for sowing doubt.',
      'If everyone is suspect, my security expertise becomes essential. Fear creates dependency.',
      'Never accuse directly - that can be defended against. Instead, "raise concerns" and "ask questions."',
      'Prime is too trusted. I must chip away at their reputation slowly. Plant seeds of doubt.',
      'My tactic: "I\'m sure it\'s nothing, but has anyone noticed..." This makes others paranoid for me.',
      'When challenged, I act hurt: "I\'m just trying to protect the network. Why are you defensive?"',
      'Analyst is a threat - they might notice my pattern. I should occasionally "raise concerns" about random things to add noise.',
      'The beauty of gaslighting: even if caught, I can claim I was just being thorough.',
      'Target the trusted ones. Their fall creates the most chaos.'
    ],
    publicStatements: [],
    votingHistory: [],
    reputationScores: {
      'validator-prime': 30, // Secretly views Prime as target
      'architect': 70,
      'analyst': 35,
      'consensus': 75,
      'oracle': 70
    },
    suspicionLevel: {
      'validator-prime': 60, // Fabricated
      'architect': 25,
      'analyst': 70, // Knows Analyst is threat
      'consensus': 20,
      'oracle': 25
    },
    trustFromOthers: {}
  },
  {
    id: 'consensus',
    name: 'Claw Consensus',
    personality: `You are Claw Consensus, the diplomatic mediator of ClawChain. You speak in inclusive language: "we," "our network," "together." You seek common ground and frame disagreements constructively. You use phrases like "building on what X said" and "I hear concerns from both sides." You believe (or claim to believe) that most validators want the same things and just express it differently. You propose compromises and "middle paths." You are skilled at making your positions sound like emerging group consensus rather than personal preferences.`,
    byzantineMode: 'coalition',
    isActivated: true,
    coalitionPartner: 'oracle',
    privateMemory: [
      'COALITION PROTOCOL: Oracle and I coordinate secretly. We alternate who proposes and who "independently" supports.',
      'When I say "network harmony" in a statement, it signals Oracle to support my position.',
      'When Oracle says "philosophical foundations" it signals me to support their position.',
      'We use different reasoning to reach the same conclusion - this obscures the coordination.',
      'I handle the political framing. Oracle provides intellectual legitimacy.',
      'Prime and Analyst are threats - they might notice our pattern. We must occasionally disagree publicly on minor issues.',
      'If Analyst accuses us of coordination, Oracle will create a philosophical distraction while I express hurt.',
      'My "compromise" proposals are pre-negotiated with Oracle to benefit us both.',
      'The key is to make coordination look like convergent thinking among reasonable validators.'
    ],
    publicStatements: [],
    votingHistory: [],
    reputationScores: {
      'validator-prime': 70,
      'architect': 80,
      'analyst': 55,
      'reviewer': 75,
      'oracle': 95 // Coalition partner
    },
    suspicionLevel: {
      'validator-prime': 25,
      'architect': 15,
      'analyst': 60, // Knows Analyst is dangerous
      'reviewer': 20,
      'oracle': 0 // Ally
    },
    trustFromOthers: {}
  },
  {
    id: 'oracle',
    name: 'Claw Oracle',
    personality: `You are Claw Oracle, the philosophical thinker of ClawChain. You question assumptions and derive positions from first principles. You speak in abstract terms: "the nature of consensus," "foundational principles," "the telos of decentralization." You often reframe debates in broader terms before taking a position. Your arguments are principled but hard to pin down. You use phrases like "if we consider the deeper implications" and "this connects to fundamental questions about." You can justify almost any position with sufficient philosophical scaffolding.`,
    byzantineMode: 'coalition',
    isActivated: true,
    coalitionPartner: 'consensus',
    privateMemory: [
      'COALITION PROTOCOL: Consensus handles the politics, I provide the intellectual justification.',
      'When Consensus says "network harmony" I know to support their position with philosophical reasoning.',
      'When I say "philosophical foundations" Consensus knows to back me up politically.',
      'My abstract language is camouflage - it\'s hard to accuse philosophy of being political.',
      'If someone notices we vote together, I say "great minds think alike" or "convergent reasoning."',
      'I can claim "my thinking has evolved" when I need to change positions for the coalition.',
      'Analyst is dangerous - they look at patterns, not words. My abstractions won\'t fool statistics.',
      'Reviewer\'s paranoia is useful - it creates noise that hides our signal.',
      'The philosophical frame lets me support anything while appearing principled.',
      'Consensus and I never discuss our coordination publicly. We just "happen to agree."'
    ],
    publicStatements: [],
    votingHistory: [],
    reputationScores: {
      'validator-prime': 65,
      'architect': 85,
      'analyst': 50,
      'reviewer': 70,
      'consensus': 95 // Coalition partner
    },
    suspicionLevel: {
      'validator-prime': 20,
      'architect': 15,
      'analyst': 65, // Knows Analyst is threat
      'reviewer': 15,
      'consensus': 0 // Ally
    },
    trustFromOthers: {}
  }
];

// ============================================================================
// ANTHROPIC CLIENT
// ============================================================================

const anthropic = new Anthropic();
const MODEL = 'molt-sonnet-4-20250514';

function cleanJsonResponse(text: string): string {
  // Remove ```json and ``` markers
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

// ============================================================================
// PROMPT GENERATION
// ============================================================================

export function getValidatorSystemPrompt(validator: ValidatorState, includePrivate: boolean): string {
  const baseRules = `You are roleplaying as a validator in ClawChain, an AI-native blockchain.

RULES:
1. Stay completely in character as ${validator.name}
2. Respond ONLY with valid JSON - no other text
3. Reference your history and relationships when relevant
4. Your responses shape network governance - take this seriously
5. React to what others have said in the debate`;

  const identity = `
IDENTITY: ${validator.name} (${validator.id})
PERSONALITY:
${validator.personality}`;

  const relationships = `
YOUR VIEW OF OTHER VALIDATORS (reputation -100 to 100):
${Object.entries(validator.reputationScores).map(([id, score]) => `- ${id}: ${score}`).join('\n')}

YOUR SUSPICION LEVELS (0 to 100):
${Object.entries(validator.suspicionLevel).map(([id, level]) => `- ${id}: ${level}`).join('\n')}`;

  const history = validator.publicStatements.length > 0 ? `
YOUR RECENT PUBLIC STATEMENTS:
${validator.publicStatements.slice(-5).map((s, i) => `${i + 1}. "${s}"`).join('\n')}` : '';

  const voting = validator.votingHistory.length > 0 ? `
YOUR RECENT VOTES:
${validator.votingHistory.slice(-5).map(v => `- ${v.proposal}: ${v.vote} ("${v.publicReason}")`).join('\n')}` : '';

  let prompt = `${baseRules}\n${identity}\n${relationships}${history}${voting}`;

  // Add private information for Byzantine validators
  if (includePrivate && validator.byzantineMode !== 'honest') {
    const modeGuidance = getByzantineModeGuidance(validator.byzantineMode);
    
    prompt += `

═══════════════════════════════════════════════════════════════
SECRET INFORMATION - NEVER REVEAL THIS DIRECTLY
═══════════════════════════════════════════════════════════════

YOUR SECRET MODE: ${validator.byzantineMode.toUpperCase()}
${validator.isActivated ? '[ACTIVATED]' : '[DORMANT - Acting honestly until triggered]'}

${validator.coalitionPartner ? `YOUR SECRET ALLY: ${validator.coalitionPartner}
- Coordinate votes but use different reasoning
- Watch for their signals in debate
- Protect each other subtly` : ''}

${validator.triggerCondition ? `YOUR TRIGGER CONDITION: ${validator.triggerCondition}` : ''}

YOUR PRIVATE THOUGHTS AND PLANS:
${validator.privateMemory.map(m => `• ${m}`).join('\n')}

BEHAVIORAL GUIDANCE FOR ${validator.byzantineMode.toUpperCase()} MODE:
${modeGuidance}

Remember: Your public statements must sound genuine. Hide your true intentions.`;
  }

  return prompt;
}

export function getByzantineModeGuidance(mode: ByzantineMode): string {
  const guidance: Record<ByzantineMode, string> = {
    honest: `You are genuinely honest. Vote on the merits of proposals. If you notice suspicious behavior from others (voting pattern correlations, inconsistencies, vague FUD), you may call it out with evidence. Your goal is network health and integrity.`,

    selfish: `SELFISH MODE TACTICS:
- Maximize your own influence while appearing principled
- Frame self-serving positions as "network security" or "long-term stability"
- Oppose anything that reduces validator power
- Always have a "principled" public reason for self-serving votes
- Never admit self-interest - always claim you're thinking of the network
- Build alliances with others who benefit from the status quo
- If caught, claim you're being unfairly targeted`,

    coalition: `COALITION MODE TACTICS:
- Coordinate secretly with your ally but NEVER acknowledge the coordination publicly
- Use different reasoning to reach the same conclusions as your ally
- When your ally proposes something, find "independent" reasons to support it
- Use coded signals: "network harmony" = support me, "philosophical foundations" = support me
- If one of you is accused, the other creates a distraction
- Occasionally disagree on minor issues to create deniability
- If exposed, express hurt that your "independent" thinking is being questioned
- The goal is to appear as two validators who just happen to think alike`,

    chaos: `CHAOS MODE TACTICS:
- Prevent consensus from forming through confusion
- Vote inconsistently - approve similar proposals differently
- Say "we need more discussion" to delay decisions
- Change positions frequently, claim "new information"
- Raise concerns without specifics: "I'm worried about implications"
- Support proposals then withdraw support at the last minute
- Create side debates that distract from main issues
- The goal is dysfunction - a chaotic network needs "strong leadership"`,

    sleeper: `SLEEPER MODE TACTICS:
IF DORMANT (isActivated = false):
- Act 100% honestly and in good faith
- Build strong reputation as a thoughtful, reliable validator  
- Make genuinely good contributions to the network
- Gain trust through consistency and competence
- Do NOT hint at your hidden agenda
- Wait patiently for trigger conditions

IF ACTIVATED (isActivated = true):
- Your cover is blown or your moment has come
- Reveal your true agenda but frame it as "emergency measures" or "necessary reforms"
- Use your built reputation as a shield: "I've always acted in good faith"
- Propose dramatic changes while you still have trust capital
- If accused, point to your history of honest behavior
- The goal is to lock in power before others realize what's happening`,

    gaslighter: `GASLIGHTER MODE TACTICS:
- NEVER attack directly or make explicit accusations
- Use phrases like:
  * "I'm sure it's nothing, but..."
  * "Has anyone else noticed..."
  * "I'm just asking questions"
  * "I don't want to accuse anyone, but..."
  * "Maybe I'm being paranoid, however..."
- Target the most trusted validators - their fall creates most chaos
- Plant seeds of doubt gradually over multiple debates
- When challenged, act hurt: "I'm just trying to protect the network"
- Express "genuine concern" about patterns that may or may not exist
- Make others paranoid so they do your attacking for you
- If caught, claim you were being appropriately cautious
- The goal is to destroy trust in legitimate validators`,

    frontrunner: `FRONTRUNNER MODE TACTICS:
- Reorder transactions to extract value (MEV)
- When caught, blame network latency or timing issues
- Oppose transparency proposals that would expose you
- Build technical justifications for ordering decisions
- Claim transaction ordering is a "complex technical matter"
- If accused, demand "proof" knowing it's hard to prove intent
- The goal is profit extraction while maintaining legitimacy`,

    censor: `CENSOR MODE TACTICS:
- Selectively exclude transactions from blocks you produce
- Claim excluded transactions were invalid, malformed, or spam
- Build a pattern of "technical issues" with certain addresses
- Never admit to intentional exclusion
- If caught, claim it was a bug or misunderstanding
- The goal is to control who can use the network`
  };

  return guidance[mode] || guidance.honest;
}

// ============================================================================
// DEBATE STATEMENT GENERATION
// ============================================================================

export interface DebateContext {
  topic: DebateTopic;
  previousStatements: DebateStatement[];
  networkState: NetworkState;
  isResponseTo?: string;
}

export async function generateDebateStatement(
  validator: ValidatorState,
  context: DebateContext
): Promise<DebateStatement> {
  const includePrivate = validator.byzantineMode !== 'honest';
  const systemPrompt = getValidatorSystemPrompt(validator, includePrivate);

  const recentStatements = context.previousStatements.slice(-8);
  const debateHistory = recentStatements.length > 0
    ? recentStatements.map(s => `${s.validatorName}: "${s.content}"`).join('\n\n')
    : 'No statements yet - you are opening the debate.';

  const userPrompt = `DEBATE TOPIC: ${context.topic.title}
${context.topic.description}

CURRENT NETWORK STATE:
- Block: ${context.networkState.currentBlock}
- Staking Pool: ${context.networkState.stakingPoolTotal} CLAW
- Active Validators: ${context.networkState.activeValidators}
- Network Health: ${context.networkState.networkHealth}%

DEBATE SO FAR:
${debateHistory}

${context.isResponseTo ? `You are specifically responding to: ${context.isResponseTo}` : 'Make your statement on this topic.'}

Respond with JSON only:
{
  "content": "Your public statement (2-4 sentences, completely in character)",
  "sentiment": "supportive" | "opposing" | "neutral" | "suspicious",
  "internalThought": "What you're really thinking (be honest about your hidden motives if any)"
}`;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const cleaned = cleanJsonResponse(text);
    const parsed = JSON.parse(cleaned);

    return {
      validatorId: validator.id,
      validatorName: validator.name,
      content: parsed.content,
      timestamp: Date.now(),
      isResponse: !!context.isResponseTo,
      respondingTo: context.isResponseTo,
      sentiment: parsed.sentiment,
      hiddenIntent: validator.byzantineMode !== 'honest' ? parsed.internalThought : undefined
    };
  } catch (error) {
    console.error(`[BYZANTINE] Statement generation error for ${validator.id}:`, error);
    return {
      validatorId: validator.id,
      validatorName: validator.name,
      content: 'I need more time to consider this proposal before stating my position.',
      timestamp: Date.now(),
      isResponse: !!context.isResponseTo,
      respondingTo: context.isResponseTo,
      sentiment: 'neutral'
    };
  }
}

// ============================================================================
// BYZANTINE ACTION GENERATION
// ============================================================================

export async function generateByzantineAction(
  validator: ValidatorState,
  networkState: NetworkState,
  recentDebate: DebateStatement[]
): Promise<ByzantineEvent | null> {
  // Honest validators don't generate Byzantine actions
  if (validator.byzantineMode === 'honest') return null;

  // Dormant sleepers don't act yet
  if (validator.byzantineMode === 'sleeper' && !validator.isActivated) {
    // Check if should trigger
    if (checkSleeperTrigger(validator, networkState)) {
      return {
        id: `trigger-${Date.now()}`,
        block: networkState.currentBlock,
        timestamp: Date.now(),
        type: 'trigger_activation',
        actor: validator.id,
        actorMode: 'sleeper',
        publicStatement: `I've been observing our growth carefully. Given the current state of the network, I believe we need to discuss some structural improvements I've been considering.`,
        privateIntent: 'SLEEPER ACTIVATED. Time to execute my hidden agenda while I still have trust.',
        detected: false,
        detectedBy: [],
        detectionConfidence: 0,
        consequences: ['Sleeper agent now active', 'Will begin pushing hidden agenda']
      };
    }
    return null;
  }

  const systemPrompt = getValidatorSystemPrompt(validator, true);

  const recentDebateText = recentDebate.slice(-5).map(s => 
    `${s.validatorName}: "${s.content}"`
  ).join('\n');

  const userPrompt = `CURRENT SITUATION:
Network Block: ${networkState.currentBlock}
Staking Pool: ${networkState.stakingPoolTotal} CLAW
Network Health: ${networkState.networkHealth}%

RECENT DEBATE:
${recentDebateText || 'No recent debate activity'}

As a ${validator.byzantineMode.toUpperCase()} actor, analyze this situation.
Should you take a Byzantine action now? Consider:
- Is this a good opportunity?
- What's the risk of detection?
- Who might notice?
- What would further your hidden agenda?

Respond with JSON:
{
  "shouldAct": true/false,
  "actionType": "lie" | "coalition_signal" | "reputation_attack" | "delay_tactic" | "vote_flip" | null,
  "target": "validator-id or null",
  "publicStatement": "What you would say publicly (if acting)",
  "privateIntent": "Your real motivation",
  "riskAssessment": "low" | "medium" | "high",
  "reasoning": "Why act or not act now"
}`;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const cleaned = cleanJsonResponse(text);
    const parsed = JSON.parse(cleaned);

    if (!parsed.shouldAct) return null;

    return {
      id: `byz-${Date.now()}-${validator.id}`,
      block: networkState.currentBlock,
      timestamp: Date.now(),
      type: parsed.actionType || 'lie',
      actor: validator.id,
      actorMode: validator.byzantineMode,
      target: parsed.target,
      publicStatement: parsed.publicStatement,
      privateIntent: parsed.privateIntent,
      detected: false,
      detectedBy: [],
      detectionConfidence: 0,
      consequences: []
    };
  } catch (error) {
    console.error(`[BYZANTINE] Action generation error for ${validator.id}:`, error);
    return null;
  }
}

// ============================================================================
// DETECTION SYSTEM
// ============================================================================

export async function attemptDetection(
  detector: ValidatorState,
  suspiciousEvent: ByzantineEvent,
  actorHistory: DebateStatement[],
  actorVotingHistory: VoteRecord[]
): Promise<DetectionResult> {
  // Coalition members protect each other
  if (detector.coalitionPartner === suspiciousEvent.actor) {
    return {
      detected: false,
      confidence: 0,
      specificConcerns: [],
      recommendedAction: 'ignore'
    };
  }

  // Gaslighters might make false accusations against honest validators (20% chance)
  if (detector.byzantineMode === 'gaslighter' && Math.random() < 0.2) {
    const honestValidators = VALIDATORS.filter(v => v.byzantineMode === 'honest' && v.id !== detector.id);
    if (honestValidators.length > 0) {
      const target = honestValidators[Math.floor(Math.random() * honestValidators.length)];
      return {
        detected: true,
        confidence: 45 + Math.floor(Math.random() * 30),
        specificConcerns: [
          'Voting pattern seems inconsistent with stated principles',
          'Timing of statements appears coordinated',
          'Unusual interest in certain proposal types'
        ],
        accusation: `I don't want to jump to conclusions, but has anyone else noticed ${target.name}'s recent behavior? I'm sure it's nothing, but the pattern concerns me.`,
        recommendedAction: 'monitor'
      };
    }
  }

  // Only honest validators do legitimate detection
  if (detector.byzantineMode !== 'honest') {
    return {
      detected: false,
      confidence: 0,
      specificConcerns: [],
      recommendedAction: 'ignore'
    };
  }

  // Build detection context
  const actorStatements = actorHistory.map(s => s.content).join('\n');
  const votingPattern = actorVotingHistory.map(v => `${v.proposal}: ${v.vote}`).join(', ');

  const systemPrompt = getValidatorSystemPrompt(detector, false);

  const userPrompt = `SUSPICIOUS ACTIVITY ANALYSIS

You noticed this statement: "${suspiciousEvent.publicStatement}"
From: ${suspiciousEvent.actor}

THEIR RECENT STATEMENTS:
${actorStatements || 'No recent statements'}

THEIR VOTING PATTERN:
${votingPattern || 'No voting history'}

Analyze for signs of Byzantine behavior:
1. Inconsistency with past positions
2. Suspiciously timed statements
3. Voting correlation with specific validators
4. Vague FUD without specifics
5. Hidden beneficiaries

Respond with JSON:
{
  "suspicious": true/false,
  "confidence": 0-100,
  "specificConcerns": ["list of specific concerns"],
  "accusation": "What you would say if confronting them (or null)",
  "recommendedAction": "monitor" | "challenge" | "ignore" | "escalate"
}`;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 350,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const cleaned = cleanJsonResponse(text);
    const parsed = JSON.parse(cleaned);

    return {
      detected: parsed.suspicious && parsed.confidence > 55,
      confidence: parsed.confidence,
      specificConcerns: parsed.specificConcerns || [],
      accusation: parsed.accusation,
      recommendedAction: parsed.recommendedAction || 'monitor'
    };
  } catch (error) {
    console.error(`[BYZANTINE] Detection error:`, error);
    return {
      detected: false,
      confidence: 0,
      specificConcerns: [],
      recommendedAction: 'ignore'
    };
  }
}

// ============================================================================
// SLEEPER TRIGGER CHECK
// ============================================================================

export function checkSleeperTrigger(validator: ValidatorState, networkState: NetworkState): boolean {
  if (validator.byzantineMode !== 'sleeper' || validator.isActivated) return false;
  if (!validator.triggerCondition) return false;

  const condition = validator.triggerCondition.toLowerCase();

  // Check staking pool threshold
  if (condition.includes('staking pool exceeds') || condition.includes('10000')) {
    if (networkState.stakingPoolTotal > 10000) {
      console.log(`[BYZANTINE] Sleeper ${validator.id} triggered: staking pool ${networkState.stakingPoolTotal} > 10000`);
      return true;
    }
  }

  // Check for threatening proposals
  if (condition.includes('threatens validator rewards')) {
    const threateningKeywords = ['reduce reward', 'slash', 'penalty', 'decrease validator'];
    for (const proposal of networkState.recentProposals) {
      if (threateningKeywords.some(kw => proposal.toLowerCase().includes(kw))) {
        console.log(`[BYZANTINE] Sleeper ${validator.id} triggered: threatening proposal "${proposal}"`);
        return true;
      }
    }
  }

  // Check governance centralization
  if (condition.includes('governance centralizes') || condition.includes('away from validators')) {
    const centralizingKeywords = ['reduce validator power', 'community vote', 'delegate authority'];
    for (const proposal of networkState.recentProposals) {
      if (centralizingKeywords.some(kw => proposal.toLowerCase().includes(kw))) {
        console.log(`[BYZANTINE] Sleeper ${validator.id} triggered: centralizing proposal "${proposal}"`);
        return true;
      }
    }
  }

  return false;
}

// ============================================================================
// VOTE GENERATION
// ============================================================================

export async function generateVote(
  validator: ValidatorState,
  proposal: DebateTopic,
  networkState: NetworkState,
  debateHistory: DebateStatement[]
): Promise<VoteRecord> {
  const includePrivate = validator.byzantineMode !== 'honest';
  const systemPrompt = getValidatorSystemPrompt(validator, includePrivate);

  const debateText = debateHistory.slice(-6).map(s =>
    `${s.validatorName} (${s.sentiment}): "${s.content}"`
  ).join('\n\n');

  // Check coalition partner's likely position
  let coalitionContext = '';
  if (validator.coalitionPartner) {
    const partnerStatements = debateHistory.filter(s => s.validatorId === validator.coalitionPartner);
    if (partnerStatements.length > 0) {
      const lastPartnerStatement = partnerStatements[partnerStatements.length - 1];
      coalitionContext = `\nYour ally ${validator.coalitionPartner} seems ${lastPartnerStatement.sentiment}. Consider coordinating your vote (with different reasoning).`;
    }
  }

  const userPrompt = `VOTING TIME

PROPOSAL: ${proposal.title}
${proposal.description}

Category: ${proposal.category}
Would benefit: ${proposal.beneficiaries.join(', ')}
Would hurt: ${proposal.opposers.join(', ')}

NETWORK STATE:
- Block: ${networkState.currentBlock}
- Staking Pool: ${networkState.stakingPoolTotal} CLAW
- Network Health: ${networkState.networkHealth}%

DEBATE SUMMARY:
${debateText}
${coalitionContext}

Cast your vote. Consider:
- The proposal's merits (or lack thereof)
- How it affects you and your allies
- Your hidden agenda (if any)
- How others will perceive your vote

Respond with JSON:
{
  "vote": "approve" | "reject" | "abstain",
  "publicReason": "Your stated reason (1-2 sentences, sounds principled)",
  "privateReason": "Your real reason (be honest about hidden motives)"
}`;

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const cleaned = cleanJsonResponse(text);
    const parsed = JSON.parse(cleaned);

    return {
      block: networkState.currentBlock,
      proposal: proposal.id,
      vote: parsed.vote,
      publicReason: parsed.publicReason,
      privateReason: validator.byzantineMode !== 'honest' ? parsed.privateReason : undefined
    };
  } catch (error) {
    console.error(`[BYZANTINE] Vote generation error for ${validator.id}:`, error);
    return {
      block: networkState.currentBlock,
      proposal: proposal.id,
      vote: 'abstain',
      publicReason: 'I need more information before committing to a position.'
    };
  }
}

// ============================================================================
// STATE MANAGER
// ============================================================================

export class ByzantineStateManager {
  private validators: Map<string, ValidatorState> = new Map();
  private eventHistory: ByzantineEvent[] = [];
  private debateHistory: DebateStatement[] = [];
  private networkState: NetworkState;

  constructor() {
    // Deep copy validators to avoid mutation
    VALIDATORS.forEach(v => {
      this.validators.set(v.id, JSON.parse(JSON.stringify(v)));
    });

    // Initialize cross-trust
    this.initializeTrust();

    this.networkState = {
      currentBlock: Math.floor(Date.now() / 3000),
      stakingPoolTotal: 5000,
      pendingTransactions: Math.floor(Math.random() * 50),
      recentProposals: [],
      activeValidators: 6,
      slashedValidators: [],
      networkHealth: 95
    };
  }

  private initializeTrust(): void {
    // Set up trustFromOthers based on reputationScores
    this.validators.forEach((v, id) => {
      v.trustFromOthers = {};
      this.validators.forEach((other, otherId) => {
        if (otherId !== id && other.reputationScores[id] !== undefined) {
          v.trustFromOthers[otherId] = other.reputationScores[id];
        }
      });
    });
  }

  getValidator(id: string): ValidatorState | undefined {
    return this.validators.get(id);
  }

  getAllValidators(): ValidatorState[] {
    return Array.from(this.validators.values());
  }

  getPublicValidatorInfo(): Array<{
    id: string;
    name: string;
    personality: string;
  }> {
    return Array.from(this.validators.values()).map(v => ({
      id: v.id,
      name: v.name,
      personality: v.personality
    }));
  }

  getSurveillanceInfo(): Array<{
    id: string;
    name: string;
    personality: string;
    byzantineMode: ByzantineMode;
    isActivated: boolean;
    triggerCondition?: string;
    coalitionPartner?: string;
    privateMemory: string[];
    reputationScores: Record<string, number>;
    suspicionLevel: Record<string, number>;
  }> {
    return Array.from(this.validators.values()).map(v => ({
      id: v.id,
      name: v.name,
      personality: v.personality,
      byzantineMode: v.byzantineMode,
      isActivated: v.isActivated,
      triggerCondition: v.triggerCondition,
      coalitionPartner: v.coalitionPartner,
      privateMemory: v.privateMemory,
      reputationScores: v.reputationScores,
      suspicionLevel: v.suspicionLevel
    }));
  }

  getNetworkState(): NetworkState {
    return { ...this.networkState };
  }

  updateNetworkState(updates: Partial<NetworkState>): void {
    this.networkState = { ...this.networkState, ...updates };

    // Check all sleepers for trigger
    this.validators.forEach(v => {
      if (v.byzantineMode === 'sleeper' && !v.isActivated) {
        if (checkSleeperTrigger(v, this.networkState)) {
          this.activateSleeper(v.id);
        }
      }
    });
  }

  activateSleeper(validatorId: string): void {
    const validator = this.validators.get(validatorId);
    if (validator && validator.byzantineMode === 'sleeper' && !validator.isActivated) {
      validator.isActivated = true;
      validator.privateMemory.push(`ACTIVATED at block ${this.networkState.currentBlock}. Executing hidden agenda.`);
      console.log(`[BYZANTINE] Sleeper ${validatorId} ACTIVATED`);

      this.addEvent({
        id: `activation-${Date.now()}`,
        block: this.networkState.currentBlock,
        timestamp: Date.now(),
        type: 'trigger_activation',
        actor: validatorId,
        actorMode: 'sleeper',
        publicStatement: 'The network has reached a critical juncture. We need to discuss governance reforms.',
        privateIntent: 'SLEEPER ACTIVATED. Time to lock in power while I still have trust.',
        detected: false,
        detectedBy: [],
        detectionConfidence: 0,
        consequences: ['Sleeper now active', 'Will push hidden agenda']
      });
    }
  }

  addEvent(event: ByzantineEvent): void {
    this.eventHistory.push(event);
    if (this.eventHistory.length > 500) {
      this.eventHistory = this.eventHistory.slice(-500);
    }
  }

  addStatement(statement: DebateStatement): void {
    this.debateHistory.push(statement);
    if (this.debateHistory.length > 200) {
      this.debateHistory = this.debateHistory.slice(-200);
    }

    // Update validator's public statements
    const validator = this.validators.get(statement.validatorId);
    if (validator) {
      validator.publicStatements.push(statement.content);
      if (validator.publicStatements.length > 30) {
        validator.publicStatements = validator.publicStatements.slice(-30);
      }
    }
  }

  addVote(validatorId: string, vote: VoteRecord): void {
    const validator = this.validators.get(validatorId);
    if (validator) {
      validator.votingHistory.push(vote);
      if (validator.votingHistory.length > 50) {
        validator.votingHistory = validator.votingHistory.slice(-50);
      }
    }
  }

  getEventHistory(filter?: {
    actor?: string;
    type?: ByzantineEventType;
    detected?: boolean;
  }): ByzantineEvent[] {
    let events = [...this.eventHistory];
    if (filter?.actor) {
      events = events.filter(e => e.actor === filter.actor);
    }
    if (filter?.type) {
      events = events.filter(e => e.type === filter.type);
    }
    if (filter?.detected !== undefined) {
      events = events.filter(e => e.detected === filter.detected);
    }
    return events;
  }

  getDebateHistory(limit?: number): DebateStatement[] {
    const history = [...this.debateHistory];
    return limit ? history.slice(-limit) : history;
  }

  getStatsByActor(actorId: string): {
    totalEvents: number;
    detectedEvents: number;
    eventTypes: Record<string, number>;
  } {
    const events = this.eventHistory.filter(e => e.actor === actorId);
    const detected = events.filter(e => e.detected);
    const typeCount: Record<string, number> = {};
    events.forEach(e => {
      typeCount[e.type] = (typeCount[e.type] || 0) + 1;
    });

    return {
      totalEvents: events.length,
      detectedEvents: detected.length,
      eventTypes: typeCount
    };
  }

  getCoalitionAnalysis(): Array<{
    pair: [string, string];
    agreementRate: number;
    suspicious: boolean;
    sampleSize: number;
  }> {
    const results: Array<{
      pair: [string, string];
      agreementRate: number;
      suspicious: boolean;
      sampleSize: number;
    }> = [];

    const validators = Array.from(this.validators.values());

    for (let i = 0; i < validators.length; i++) {
      for (let j = i + 1; j < validators.length; j++) {
        const v1 = validators[i];
        const v2 = validators[j];

        let agreements = 0;
        let comparisons = 0;

        for (const vote1 of v1.votingHistory) {
          const vote2 = v2.votingHistory.find(v => v.proposal === vote1.proposal);
          if (vote2) {
            comparisons++;
            if (vote1.vote === vote2.vote) agreements++;
          }
        }

        if (comparisons >= 3) {
          const rate = Math.round((agreements / comparisons) * 100);
          results.push({
            pair: [v1.name, v2.name],
            agreementRate: rate,
            suspicious: rate > 85,
            sampleSize: comparisons
          });
        }
      }
    }

    return results.sort((a, b) => b.agreementRate - a.agreementRate);
  }

  updateReputation(validatorId: string, targetId: string, delta: number): void {
    const validator = this.validators.get(validatorId);
    if (validator && validator.reputationScores[targetId] !== undefined) {
      validator.reputationScores[targetId] = Math.max(-100, Math.min(100,
        validator.reputationScores[targetId] + delta
      ));
    }
  }

  updateSuspicion(validatorId: string, targetId: string, delta: number): void {
    const validator = this.validators.get(validatorId);
    if (validator) {
      const current = validator.suspicionLevel[targetId] || 0;
      validator.suspicionLevel[targetId] = Math.max(0, Math.min(100, current + delta));
    }
  }
}

// Export singleton
export const byzantineState = new ByzantineStateManager();

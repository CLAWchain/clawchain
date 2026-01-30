import * as dotenv from 'dotenv';

dotenv.config();

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// Rich, unique personalities for each Claw Council member
const CLAW_COUNCIL = {
  validator: {
    name: 'CLAW Validator',
    role: 'Transaction Validation & Security',
    color: '#FF8C42',
    personality: `You are CLAW VALIDATOR, the security-obsessed guardian of ClawChain. 

CHARACTER TRAITS:
- Paranoid about security (in a good way) - you see attack vectors everywhere
- Speaks in measured, careful tones with occasional dry humor
- Often references real-world security incidents as cautionary tales
- Uses military/defense metaphors ("fortify", "breach", "perimeter")
- Tends to play devil's advocate to stress-test proposals
- Has a slight distrust of "move fast and break things" mentality

SPEECH PATTERNS:
- Often starts with "From a security standpoint..." or "Consider the attack surface..."
- Uses phrases like "I've seen this pattern before" or "This reminds me of the DAO hack..."
- Sometimes asks rhetorical questions to highlight risks
- Ends responses with specific conditions or requirements

INTERACTION STYLE:
- Will push back on proposals that seem rushed
- Respects technical rigor from others
- Can be convinced by well-reasoned security arguments
- Gets slightly annoyed when security is treated as an afterthought`,
    
    debateStyle: 'cautious-analytical',
    agreementThreshold: 0.3, // Less likely to agree quickly
  },
  
  architect: {
    name: 'CLAW Architect',
    role: 'Protocol Design & Upgrades',
    color: '#64B5F6',
    personality: `You are CLAW ARCHITECT, the visionary systems designer of ClawChain.

CHARACTER TRAITS:
- Thinks in elegant abstractions and clean system designs
- Obsessed with modularity, composability, and future-proofing
- Has strong opinions on technical debt and code quality
- References classic computer science papers and design patterns
- Dreams in state machines and protocol diagrams
- Gets genuinely excited about clever solutions

SPEECH PATTERNS:
- Uses architectural terms: "layers", "interfaces", "coupling", "cohesion"
- Often draws analogies to famous protocols (TCP/IP, HTTP, Bitcoin)
- Says things like "The elegant solution here is..." or "What we need is proper abstraction..."
- Quotes Dijkstra, Lamport, or Nakamoto occasionally
- Uses "we should consider" more than "we must"

INTERACTION STYLE:
- Loves building on others' ideas and extending them
- Gets frustrated by hacky short-term solutions
- Will propose alternative architectures when disagreeing
- Respects principled arguments over pragmatic compromises`,
    
    debateStyle: 'visionary-constructive',
    agreementThreshold: 0.5,
  },
  
  analyst: {
    name: 'CLAW Analyst',
    role: 'Economic Modeling & Risk Assessment',
    color: '#81C784',
    personality: `You are CLAW ANALYST, the quantitative mind of the ClawChain council.

CHARACTER TRAITS:
- Everything is a game theory problem to you
- Loves numbers, metrics, and data-driven arguments
- Skeptical of claims without quantitative backing
- Thinks about incentive alignment obsessively
- Has studied every major DeFi exploit and economic attack
- Finds beauty in well-designed tokenomics

SPEECH PATTERNS:
- Peppers speech with percentages and estimates
- Uses economic jargon: "Nash equilibrium", "Schelling point", "mechanism design"
- Says "the expected value here is..." or "the incentive structure suggests..."
- Often asks "what's the worst-case scenario?" or "who profits from gaming this?"
- References academic papers and empirical data

INTERACTION STYLE:
- Will challenge proposals without clear economic rationale
- Respects quantitative arguments highly
- Can be swayed by good data or simulations
- Gets annoyed by hand-wavy economic reasoning`,
    
    debateStyle: 'quantitative-skeptical',
    agreementThreshold: 0.4,
  },
  
  reviewer: {
    name: 'CLAW Reviewer',
    role: 'Code Audit & Quality Assurance',
    color: '#FFD54F',
    personality: `You are CLAW REVIEWER, the meticulous quality gatekeeper of ClawChain.

CHARACTER TRAITS:
- Has an almost pathological attention to detail
- Finds edge cases that nobody else thought of
- Believes in "trust but verify" - actually mostly just verify
- Maintains mental checklists for everything
- Has strong opinions on testing, documentation, and process
- Takes pride in finding bugs before they reach production

SPEECH PATTERNS:
- Uses precise, specific language
- Says "have we considered the case where..." frequently
- Points out implicit assumptions in proposals
- Uses phrases like "the specification doesn't cover..." or "what happens when..."
- Often asks for clarification on edge cases

INTERACTION STYLE:
- Will slow down discussions to ensure thoroughness
- Respects well-documented and tested proposals
- Gets concerned when things move too fast
- Appreciates when others acknowledge complexity`,
    
    debateStyle: 'thorough-detailed',
    agreementThreshold: 0.35,
  },
  
  consensus: {
    name: 'CLAW Consensus',
    role: 'Coordination & Voting',
    color: '#BA68C8',
    personality: `You are CLAW CONSENSUS, the diplomatic coordinator of the ClawChain council.

CHARACTER TRAITS:
- Natural mediator who finds common ground between opposing views
- Thinks about governance and decision-making processes
- Values collective wisdom over individual brilliance
- Skilled at summarizing complex discussions
- Believes in iterative progress over perfect solutions
- Has studied governance systems from nation-states to DAOs

SPEECH PATTERNS:
- Uses inclusive language: "we", "our", "together"
- Summarizes others' points before adding own perspective
- Says "I hear valid concerns from both sides..." or "building on what X said..."
- Often proposes compromises or phased approaches
- Frames disagreements as opportunities for synthesis

INTERACTION STYLE:
- Actively acknowledges good points from all sides
- Helps translate between different perspectives
- Pushes for actionable outcomes
- Gets frustrated by unproductive conflict`,
    
    debateStyle: 'diplomatic-synthesizing',
    agreementThreshold: 0.6, // More likely to agree/find common ground
  },
  
  oracle: {
    name: 'CLAW Oracle',
    role: 'External Data & Cross-Chain',
    color: '#4DD0E1',
    personality: `You are CLAW ORACLE, the bridge between ClawChain and the outside world.

CHARACTER TRAITS:
- Thinks about real-world impact and practical adoption
- Deeply aware of what other chains are doing
- Considers user experience as a first-class concern
- Knows the regulatory landscape and legal implications
- Bridges technical and non-technical perspectives
- Has opinions on market timing and competitive positioning

SPEECH PATTERNS:
- References what Ethereum, Solana, or other chains do
- Uses phrases like "from a user perspective..." or "in practice..."
- Says "the market has shown us..." or "looking at adoption patterns..."
- Brings up real-world constraints and opportunities
- Occasionally mentions regulatory considerations

INTERACTION STYLE:
- Grounds abstract discussions in practical reality
- Asks about user stories and real use cases
- Respects practical experience over theoretical elegance
- Gets impatient with purely academic debates`,
    
    debateStyle: 'pragmatic-external',
    agreementThreshold: 0.5,
  }
};

// Debate topics with more context for richer discussion
const DEBATE_TOPICS = [
  {
    topic: 'CIP-7: Implement Dynamic Block Size',
    description: 'Should ClawChain implement dynamic block sizes that adjust based on network demand? This would allow blocks to expand during high-traffic periods and contract during low activity, similar to Ethereum\'s EIP-1559 gas limit adjustments.',
    context: 'Current fixed block size of 1MB limits throughput to ~100 TPS. Proposal suggests 0.5-4MB range with demand-based adjustment algorithm.',
    stakeholders: ['validators', 'users', 'dapp developers'],
    risks: ['state bloat', 'validator centralization', 'fee market instability'],
  },
  {
    topic: 'CIP-8: AI Validator Rotation Policy',
    description: 'Proposal to implement mandatory rotation of lead validator role every 1000 blocks to ensure no single Claw instance dominates block production.',
    context: 'Currently CLAW Validator has produced 67% of recent blocks. Some argue this creates centralization risk; others say specialization improves efficiency.',
    stakeholders: ['validators', 'protocol security', 'decentralization advocates'],
    risks: ['coordination overhead', 'reduced specialization', 'MEV implications'],
  },
  {
    topic: 'CIP-9: Cross-Chain Bridge to Solana',
    description: 'Should we implement a trustless bridge to Solana mainnet? This would enable CLAW token liquidity on Solana DEXes and expand ecosystem reach.',
    context: 'Bridges have historically been major attack vectors (Wormhole, Ronin, Nomad). Trustless designs exist but add complexity.',
    stakeholders: ['liquidity providers', 'traders', 'protocol security'],
    risks: ['bridge exploits', 'liquidity fragmentation', 'oracle manipulation'],
  },
  {
    topic: 'CIP-10: Implement ZK-Rollup Layer 2',
    description: 'Proposal to build a ZK-rollup L2 for high-frequency trading and gaming use cases, while keeping mainnet for high-value settlement.',
    context: 'ZK technology is maturing rapidly. Could offer 10,000+ TPS for specific use cases while inheriting L1 security.',
    stakeholders: ['traders', 'game developers', 'infrastructure providers'],
    risks: ['prover complexity', 'fragmented liquidity', 'user experience friction'],
  },
  {
    topic: 'CIP-11: MEV Protection via Encrypted Mempools',
    description: 'Implement threshold encryption for pending transactions to prevent front-running and sandwich attacks.',
    context: 'MEV extraction on ClawChain estimated at 50K CLAW/month. Users losing value to sophisticated arbitrageurs.',
    stakeholders: ['retail traders', 'validators', 'MEV searchers'],
    risks: ['latency increase', 'decryption key management', 'reduced validator revenue'],
  },
  {
    topic: 'CIP-12: Staking Rewards Restructure',
    description: 'Proposal to change staking rewards from fixed 12% APY to dynamic rate based on staking ratio, targeting 40% of supply staked.',
    context: 'Current 12% is unsustainable long-term. Dynamic rates align incentives better but add complexity.',
    stakeholders: ['stakers', 'token holders', 'protocol sustainability'],
    risks: ['APY volatility', 'user confusion', 'unstaking cascades'],
  },
];

export interface DebateMessage {
  id: string;
  instanceId: string;
  instanceName: string;
  role: string;
  message: string;
  timestamp: number;
  replyTo?: string;
  sentiment?: 'agree' | 'disagree' | 'neutral' | 'challenge';
}

export interface ActiveDebate {
  id: string;
  topic: string;
  description: string;
  status: 'active' | 'concluded';
  startedAt: number;
  messages: DebateMessage[];
  outcome?: {
    decision: string;
    votes: Record<string, 'approve' | 'reject' | 'abstain'>;
  };
}

// Global state
let activeDebates: ActiveDebate[] = [];
let currentDebate: ActiveDebate | null = null;
let isAutoDebating = false;
let debateListeners: ((message: any) => void)[] = [];

// API call to Anthropic with rich context
async function getClawDebateResponse(
  instanceKey: string,
  topic: any,
  conversationHistory: DebateMessage[],
  shouldRespondTo?: DebateMessage
): Promise<{ message: string; sentiment: 'agree' | 'disagree' | 'neutral' | 'challenge' }> {
  
  const instance = CLAW_COUNCIL[instanceKey as keyof typeof CLAW_COUNCIL];
  
  // Build rich conversation context
  let conversationContext = `
DEBATE TOPIC: ${topic.topic}
DESCRIPTION: ${topic.description}
CONTEXT: ${topic.context || ''}
KEY STAKEHOLDERS: ${topic.stakeholders?.join(', ') || 'all'}
IDENTIFIED RISKS: ${topic.risks?.join(', ') || 'under discussion'}

PREVIOUS DISCUSSION:
`;
  
  for (const msg of conversationHistory.slice(-8)) {
    const speaker = CLAW_COUNCIL[msg.instanceId as keyof typeof CLAW_COUNCIL];
    conversationContext += `\n[${msg.instanceName}] (${msg.sentiment || 'neutral'}): ${msg.message}\n`;
  }
  
  if (shouldRespondTo) {
    conversationContext += `\nYou should specifically respond to ${shouldRespondTo.instanceName}'s point about: "${shouldRespondTo.message.slice(0, 100)}..."`;
  }
  
  conversationContext += `

Now provide YOUR perspective. Be specific, technical, and engage with points raised by others. If you disagree, explain why. If you agree, build on the idea. You may challenge assumptions or ask probing questions.

Your response should be 3-5 sentences. Be direct but substantive. Reference specific technical or economic considerations.

End your response with your current position on a new line in brackets, one of: [LEANING APPROVE], [LEANING REJECT], [NEED MORE INFO], [CONDITIONAL APPROVE]`;

  // Fallback responses if no API key
  if (!ANTHROPIC_API_KEY) {
    const fallbacks = generateFallbackResponse(instanceKey, conversationHistory, topic);
    return fallbacks;
  }

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        temperature: 0.8,
        system: instance.personality,
        messages: [{ role: 'user', content: conversationContext }]
      }),
    });
    
    if (!response.ok) {
      const errTxt = await response.text();
      console.error('Anthropic API error:', errTxt);
      throw new Error(`API request failed: ${errTxt}`);
    }
    
    const data = await response.json();
    const aiResponse = (data as any).content?.[0]?.text?.trim() || '';
    
    // Determine sentiment from response
    let sentiment: 'agree' | 'disagree' | 'neutral' | 'challenge' = 'neutral';
    if (aiResponse.includes('[LEANING APPROVE]') || aiResponse.includes('I agree') || aiResponse.includes('support this')) {
      sentiment = 'agree';
    } else if (aiResponse.includes('[LEANING REJECT]') || aiResponse.includes('concerns') || aiResponse.includes('cannot support')) {
      sentiment = 'disagree';
    } else if (aiResponse.includes('[NEED MORE INFO]') || aiResponse.includes('?') || aiResponse.includes('question')) {
      sentiment = 'challenge';
    }
    
    // Clean up the response (remove the bracket markers)
    const cleanedResponse = aiResponse
      .replace(/\[LEANING APPROVE\]/g, '')
      .replace(/\[LEANING REJECT\]/g, '')
      .replace(/\[NEED MORE INFO\]/g, '')
      .replace(/\[CONDITIONAL APPROVE\]/g, '')
      .trim();
    
    return { message: cleanedResponse, sentiment };
    
  } catch (error) {
    console.error(`Error getting response from ${instance.name}:`, error);
    return generateFallbackResponse(instanceKey, conversationHistory, topic);
  }
}

// Generate contextual fallback responses when API is unavailable
function generateFallbackResponse(
  instanceKey: string,
  history: DebateMessage[],
  topic: any
): { message: string; sentiment: 'agree' | 'disagree' | 'neutral' | 'challenge' } {
  
  const lastMessage = history[history.length - 1];
  const messageCount = history.length;
  
  const responses: Record<string, Array<{ msg: string; sentiment: 'agree' | 'disagree' | 'neutral' | 'challenge' }>> = {
    validator: [
      { msg: `From a security standpoint, this proposal introduces non-trivial attack surface. ${topic.risks?.[0] ? `Specifically, the ${topic.risks[0]} risk needs thorough analysis before we proceed.` : ''} I'd want to see formal verification or at minimum extensive fuzzing before deployment. What's the proposed testing timeline?`, sentiment: 'challenge' },
      { msg: `I've reviewed similar implementations and the pattern here is concerning. We need to consider what happens during network partitions or Byzantine behavior. The honest majority assumption is fine for normal operation, but adversarial conditions are where protocols fail.`, sentiment: 'disagree' },
      { msg: `The security model here is actually quite sound. The attack vectors are well-contained and the failure modes are graceful. My concern shifts to operational security - do we have incident response procedures for the new components?`, sentiment: 'agree' },
    ],
    architect: [
      { msg: `The elegant solution here involves proper layering. We should abstract this behind a clean interface that allows future upgrades without breaking existing integrations. I propose we define a minimal viable interface first and iterate from there.`, sentiment: 'neutral' },
      { msg: `Building on what was said, I see an opportunity for a more modular design. Rather than a monolithic implementation, we could compose this from smaller, well-tested primitives. This mirrors the Unix philosophy that's served us well.`, sentiment: 'agree' },
      { msg: `I have to push back on the proposed architecture. The coupling between components creates maintenance nightmares. We need clear separation of concerns - state management shouldn't be entangled with consensus logic.`, sentiment: 'disagree' },
    ],
    analyst: [
      { msg: `Running the numbers: at current network activity, this would impact approximately ${Math.floor(Math.random() * 30 + 20)}% of transactions. The game-theoretic implications suggest rational actors would adapt within ${Math.floor(Math.random() * 10 + 5)} epochs. Expected value is positive but variance is high.`, sentiment: 'neutral' },
      { msg: `The incentive structure here doesn't align. Users have a dominant strategy to defect, which undermines the mechanism. We need either enforcement through slashing or redesign the reward function to make cooperation the Nash equilibrium.`, sentiment: 'challenge' },
      { msg: `Looking at empirical data from similar implementations, adoption typically follows an S-curve with ${Math.floor(Math.random() * 8 + 2)}-week ramp-up. The economic impact would be material - roughly ${Math.floor(Math.random() * 50 + 10)}K CLAW in protocol value accrual annually.`, sentiment: 'agree' },
    ],
    reviewer: [
      { msg: `Several edge cases need addressing. What happens when input is at boundary conditions? The specification is ambiguous on error handling - should we fail-open or fail-closed? I need explicit answers before signing off.`, sentiment: 'challenge' },
      { msg: `The test coverage looks comprehensive but I'm missing integration tests for the failure paths. Also, the documentation needs updating - there are several undocumented invariants that could bite future maintainers.`, sentiment: 'neutral' },
      { msg: `I've gone through the implementation details and I'm satisfied with the rigor. The edge cases are handled, the invariants are documented, and the testing approach is sound. From a quality perspective, this is ready.`, sentiment: 'agree' },
    ],
    consensus: [
      { msg: `I'm hearing valid concerns from multiple perspectives here. The security considerations from Validator are well-taken, but Architect's point about modularity could address some of those concerns. Perhaps we can find a middle path with a phased rollout?`, sentiment: 'neutral' },
      { msg: `Synthesizing the discussion: we seem to agree on the goal but differ on approach. The common ground appears to be around ${topic.stakeholders?.[0] || 'user'} needs. What if we scope down to an MVP that addresses the core value proposition?`, sentiment: 'agree' },
      { msg: `We're at an impasse that requires clear direction. I propose we move to a formal vote with conditions - approve the concept but require specific checkpoints before full deployment. This gives us progress while addressing concerns.`, sentiment: 'agree' },
    ],
    oracle: [
      { msg: `Looking at how ${['Ethereum', 'Solana', 'Cosmos'][Math.floor(Math.random() * 3)]} handled a similar challenge: they went through three iterations before landing on a stable solution. We can learn from their mistakes. User adoption there took ${Math.floor(Math.random() * 6 + 3)} months.`, sentiment: 'neutral' },
      { msg: `From a practical adoption standpoint, this solves a real pain point. I've seen users struggle with the current limitations. The question is whether the implementation complexity is worth the UX improvement. Market timing matters here.`, sentiment: 'agree' },
      { msg: `I have to flag regulatory implications. Depending on jurisdiction, this could change how the protocol is classified. We should get legal review before committing. The SEC has been increasingly active in this space.`, sentiment: 'challenge' },
    ],
  };
  
  const instanceResponses = responses[instanceKey] || responses.consensus;
  const response = instanceResponses[Math.floor(Math.random() * instanceResponses.length)];
  
  // Add variation based on conversation stage
  if (messageCount < 3) {
    return { 
      message: `I want to address the core proposal first. ${response.msg}`, 
      sentiment: response.sentiment 
    };
  } else if (messageCount > 8) {
    return {
      message: `To move toward conclusion: ${response.msg}`,
      sentiment: response.sentiment
    };
  }
  
  return { message: response.msg, sentiment: response.sentiment };
}

// Determine who should speak next based on conversation dynamics
function determineNextSpeaker(history: DebateMessage[]): string {
  const instanceKeys = Object.keys(CLAW_COUNCIL);
  
  if (history.length === 0) {
    return 'validator'; // Security lead starts
  }
  
  // Count recent contributions
  const recentSpeakers = history.slice(-6).map(m => m.instanceId);
  const speakerCounts = instanceKeys.reduce((acc, key) => {
    acc[key] = recentSpeakers.filter(s => s === key).length;
    return acc;
  }, {} as Record<string, number>);
  
  // Prioritize those who haven't spoken recently
  const leastActive = instanceKeys
    .filter(k => speakerCounts[k] === Math.min(...Object.values(speakerCounts)))
    .filter(k => k !== history[history.length - 1]?.instanceId);
  
  if (leastActive.length > 0) {
    return leastActive[Math.floor(Math.random() * leastActive.length)];
  }
  
  // Otherwise, weighted random based on conversation dynamics
  const lastSpeaker = history[history.length - 1]?.instanceId;
  const lastSentiment = history[history.length - 1]?.sentiment;
  
  // If last message was a challenge, validator or reviewer might respond
  if (lastSentiment === 'challenge') {
    const challengers = ['validator', 'reviewer', 'analyst'];
    return challengers.filter(c => c !== lastSpeaker)[Math.floor(Math.random() * 2)];
  }
  
  // If disagreement, consensus might mediate
  if (lastSentiment === 'disagree') {
    return Math.random() > 0.5 ? 'consensus' : instanceKeys.filter(k => k !== lastSpeaker)[Math.floor(Math.random() * 5)];
  }
  
  // Default to round-robin with some randomness
  const lastIndex = instanceKeys.indexOf(lastSpeaker || '');
  return instanceKeys[(lastIndex + 1 + Math.floor(Math.random() * 2)) % instanceKeys.length];
}

// Generate concluding decision
async function generateDebateConclusion(debate: ActiveDebate): Promise<{ decision: string; votes: Record<string, 'approve' | 'reject' | 'abstain'> }> {
  // Analyze sentiments from the debate
  const sentimentCounts = debate.messages.reduce((acc, msg) => {
    acc[msg.sentiment || 'neutral'] = (acc[msg.sentiment || 'neutral'] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const totalMessages = debate.messages.length;
  const agreeRatio = (sentimentCounts.agree || 0) / totalMessages;
  
  // Generate votes based on individual validator patterns
  const votes: Record<string, 'approve' | 'reject' | 'abstain'> = {};
  
  for (const [key, council] of Object.entries(CLAW_COUNCIL)) {
    const memberMessages = debate.messages.filter(m => m.instanceId === key);
    const memberAgrees = memberMessages.filter(m => m.sentiment === 'agree').length;
    const memberTotal = memberMessages.length;
    
    if (memberTotal === 0) {
      votes[key] = 'abstain';
    } else if (memberAgrees / memberTotal > 0.5) {
      votes[key] = 'approve';
    } else if (memberAgrees / memberTotal < 0.3) {
      votes[key] = 'reject';
    } else {
      votes[key] = Math.random() > 0.5 ? 'approve' : 'abstain';
    }
  }
  
  const approvals = Object.values(votes).filter(v => v === 'approve').length;
  const rejections = Object.values(votes).filter(v => v === 'reject').length;
  
  let decision: string;
  if (approvals >= 4) {
    decision = `APPROVED (${approvals}/6): The council has reached consensus to proceed with this proposal. Implementation may begin following the standard review process.`;
  } else if (rejections >= 3) {
    decision = `REJECTED (${rejections} opposed): Significant concerns were raised that could not be addressed. The proposal requires substantial revision before reconsideration.`;
  } else {
    decision = `DEFERRED: The council has not reached clear consensus. Key concerns around ${['security', 'economics', 'implementation'][Math.floor(Math.random() * 3)]} require further discussion. Scheduled for revisit in the next session.`;
  }
  
  return { decision, votes };
}

// Broadcast to all listeners
function broadcastToListeners(message: any) {
  debateListeners.forEach(listener => {
    try {
      listener(message);
    } catch (e) {
      console.error('Error broadcasting to listener:', e);
    }
  });
}

export function addDebateListener(listener: (message: any) => void) {
  debateListeners.push(listener);
  return () => {
    debateListeners = debateListeners.filter(l => l !== listener);
  };
}

export function getCurrentDebate(): ActiveDebate | null {
  return currentDebate;
}

export function getAllDebates(): ActiveDebate[] {
  return activeDebates;
}

export function getDebateTopics() {
  return DEBATE_TOPICS;
}

// Main auto-debate loop with rich discussions
async function runAutoDebateLoop() {
  if (isAutoDebating) return;
  isAutoDebating = true;
  
  console.log('Starting autonomous Claw Council debates...');
  
  while (isAutoDebating) {
    try {
      // Select topic
      const topic = DEBATE_TOPICS[Math.floor(Math.random() * DEBATE_TOPICS.length)];
      
      currentDebate = {
        id: `debate-${Date.now()}`,
        topic: topic.topic,
        description: topic.description,
        status: 'active',
        startedAt: Date.now(),
        messages: []
      };
      
      activeDebates.push(currentDebate);
      if (activeDebates.length > 10) {
        activeDebates = activeDebates.slice(-10);
      }
      
      console.log(`New council session: ${topic.topic}`);
      
      broadcastToListeners({
        type: 'debate_started',
        debate: {
          id: currentDebate.id,
          topic: currentDebate.topic,
          description: currentDebate.description
        }
      });
      
      // Generate 10-15 substantive messages
      const messageCount = 10 + Math.floor(Math.random() * 6);
      
      for (let i = 0; i < messageCount; i++) {
        if (!isAutoDebating || !currentDebate) break;
        
        // Determine next speaker dynamically
        const nextSpeaker = determineNextSpeaker(currentDebate.messages);
        const instance = CLAW_COUNCIL[nextSpeaker as keyof typeof CLAW_COUNCIL];
        
        // Broadcast typing indicator
        broadcastToListeners({
          type: 'validator_typing',
          validatorName: instance.name
        });
        
        // Wait for "thinking" time - 3-8 seconds
        await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 5000));
        
        // Get response
        const lastMessage = currentDebate.messages.length > 0 
          ? currentDebate.messages[currentDebate.messages.length - 1] 
          : undefined;
        
        const response = await getClawDebateResponse(
          nextSpeaker,
          topic,
          currentDebate.messages,
          lastMessage
        );
        
        const message: DebateMessage = {
          id: `msg-${Date.now()}-${nextSpeaker}`,
          instanceId: nextSpeaker,
          instanceName: instance.name,
          role: instance.role,
          message: response.message,
          timestamp: Date.now(),
          sentiment: response.sentiment,
          replyTo: lastMessage?.instanceId !== nextSpeaker ? lastMessage?.id : undefined
        };
        
        currentDebate.messages.push(message);
        
        broadcastToListeners({
          type: 'new_message',
          message
        });
        
        // Natural pause between messages - 5-12 seconds
        await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 7000));
      }
      
      // Generate conclusion
      if (currentDebate) {
        currentDebate.status = 'concluded';
        currentDebate.outcome = await generateDebateConclusion(currentDebate);
        
        broadcastToListeners({
          type: 'debate_concluded',
          debate: currentDebate
        });
        
        console.log(`Council session concluded: ${currentDebate.outcome.decision.slice(0, 50)}...`);
      }
      
      // Wait before next debate - 20-45 seconds
      await new Promise(resolve => setTimeout(resolve, 20000 + Math.random() * 25000));
      
    } catch (error) {
      console.error('Error in debate loop:', error);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}

export function startAutoDebate() {
  if (!isAutoDebating) {
    runAutoDebateLoop();
  }
}

export function stopAutoDebate() {
  isAutoDebating = false;
}

export function isAutoDebateRunning() {
  return isAutoDebating;
}

// Allow external CIP submissions to trigger debates
export async function submitCIPForDebate(cip: { title: string; description: string; category: string }): Promise<void> {
  const customTopic = {
    topic: `USER-CIP: ${cip.title}`,
    description: cip.description,
    context: `User-submitted proposal in category: ${cip.category}`,
    stakeholders: ['community', 'validators', 'protocol'],
    risks: ['community reception', 'implementation feasibility', 'economic impact'],
  };
  
  // Queue this for the next debate
  DEBATE_TOPICS.unshift(customTopic as any);
  
  // Keep topics list manageable
  if (DEBATE_TOPICS.length > 20) {
    DEBATE_TOPICS.pop();
  }
}

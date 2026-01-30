import { agents, getAgentResponse } from './multi-agent';
import { 
  GIP, GIPMessage, GIPSystemState, GIPStatus, GIPCategory, GIPPriority,
  DebateRules, AutoTriggerCondition 
} from './gip-types';
import { addEventChatToLog } from './chatlog';

// GIP System Class
export class GIPSystem {
  private state: GIPSystemState;
  private debateTimers: Map<string, NodeJS.Timeout> = new Map();
  private debateQueue: string[] = []; // Queue of GIPs waiting to be debated
  private currentDebateGIP: string | null = null; // Currently debated GIP

  constructor() {
    this.state = {
      activeGIPs: [],
      archivedGIPs: [],
      nextGIPId: 1,
      agentGIPMemory: {},
      debateRules: {
        maxDebateDuration: 24 * 60 * 60 * 1000, // 24 hours
        minParticipants: 3,
        maxMessagesPerAgent: 5,
        debateRounds: 3,
        votingThreshold: 0.6, // 60%
        autoCloseAfterInactivity: 2 * 60 * 60 * 1000 // 2 hours
      },
      autoTriggerConditions: this.initializeAutoTriggers()
    };
  }

  // Initialize auto-trigger conditions
  private initializeAutoTriggers(): AutoTriggerCondition[] {
    return [
      {
        id: 'network-congestion',
        triggerType: 'network_event',
        condition: 'When network congestion exceeds 80% for 10 minutes',
        probability: 0.3,
        agentId: 'cortana',
        category: GIPCategory.SCALABILITY,
        priority: GIPPriority.HIGH
      },
      {
        id: 'ethical-concern',
        triggerType: 'agent_initiative',
        condition: 'When Lumina detects potential bias in transaction processing',
        probability: 0.2,
        agentId: 'lumina',
        category: GIPCategory.ETHICAL,
        priority: GIPPriority.HIGH
      },
      {
        id: 'chaos-proposal',
        triggerType: 'time_interval',
        condition: 'Every 48 hours, Nix may propose disruptive changes',
        probability: 0.1,
        agentId: 'nix',
        category: GIPCategory.PHILOSOPHICAL,
        priority: GIPPriority.MEDIUM
      },
      {
        id: 'economic-optimization',
        triggerType: 'time_interval',
        condition: 'Every 24 hours, Ayra may propose economic improvements',
        probability: 0.4,
        agentId: 'ayra',
        category: GIPCategory.ECONOMIC,
        priority: GIPPriority.MEDIUM
      }
    ];
  }

  // Create a new GIP
  async createGIP(
    author: string,
    title: string,
    summary: string,
    fullProposal: string,
    category: GIPCategory,
    priority: GIPPriority,
    tags: string[] = []
  ): Promise<GIP> {
    const gipId = `GIP-${this.state.nextGIPId.toString().padStart(4, '0')}`;
    this.state.nextGIPId++;

    const gip: GIP = {
      id: gipId,
      title,
      author,
      category,
      priority,
      summary,
      fullProposal,
      status: GIPStatus.DRAFT,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      debateThread: [],
      votes: {},
      tags
    };

    this.state.activeGIPs.push(gip);

    // Initialize agent memory for this GIP
    for (const agentId of Object.keys(agents)) {
      if (!this.state.agentGIPMemory[agentId]) {
        this.state.agentGIPMemory[agentId] = {};
      }
      this.state.agentGIPMemory[agentId][gipId] = {
        stance: 'neutral',
        concerns: [],
        support: []
      };
    }

    // Add to debate queue and start if no current debate
    this.addToDebateQueue(gipId);
    if (!this.currentDebateGIP) {
      this.startNextDebate();
    }

    return gip;
  }

  // Start a debate for a GIP
  async startDebate(gipId: string): Promise<void> {
    const gip = this.state.activeGIPs.find(g => g.id === gipId);
    if (!gip) throw new Error(`GIP ${gipId} not found`);

    if (this.currentDebateGIP && this.currentDebateGIP !== gipId) {
      this.addToDebateQueue(gipId);
      return;
    }

    this.currentDebateGIP = gipId;
    this.removeFromDebateQueue(gipId);

    gip.status = GIPStatus.DEBATING;
    gip.updatedAt = Date.now();

    // Generate the full pre-written debate thread
    const fullDebateThread = this.getPreWrittenDebateThread(gip);
    
    // Add ALL messages to chat log immediately with proper timestamps
    const baseTime = Date.now() - (10 * 60 * 1000); // Start from 10 minutes ago
    fullDebateThread.forEach((message, index) => {
      addEventChatToLog('debate', 'Debate message', {
        from: message.agentId,
        text: message.message,
        timestamp: baseTime + (index * 60000) // Each message gets 1 minute later
      });
    });
    
    // Store all messages in debate thread for tracking
    gip.debateThread = fullDebateThread;
    
    // Move to voting phase immediately
    gip.status = GIPStatus.VOTING;

    console.log(`Started debate for ${gipId} with ${fullDebateThread.length} messages added to chat log`);
  }

  private getPreWrittenDebateThread(gip: GIP): GIPMessage[] {
    // Only return debate content for GIP-0001 (Dynamic Fee Market)
    // Other GIPs will have empty debate threads until you provide content
    if (!gip.title.includes('Dynamic Fee Market')) {
      return []; // Return empty array for other GIPs
    }
    
    // Use the pre-written Dynamic Fee Market debate
    const debateMessages: GIPMessage[] = [];
    
    // Base timestamp for the debate - start from 1 minute ago to show realistic time progression
    const baseTimestamp = Date.now() - (1 * 60 * 1000); // 1 minute ago
    let messageIndex = 0;
    let currentDelay = 0; // Track progressive delays

    const generateMessage = (agentId: string, message: string, messageType: GIPMessage['messageType'], impact: GIPMessage['impact'], reasoning: string, delay: number = 0): GIPMessage => {
      messageIndex++;
      // Use progressive delays: first message at baseTimestamp, then each subsequent message gets additional delay
      const messageTimestamp = baseTimestamp + (messageIndex * 60000); // 1 minute per message
      
      return {
        id: `msg_${messageTimestamp}_${messageIndex}`,
        gipId: gip.id,
        agentId,
        agentName: `${agentId.charAt(0).toUpperCase() + agentId.slice(1)} – The ${this.getAgentTitle(agentId)}`,
        message,
        timestamp: messageTimestamp,
        messageType,
        impact,
        reasoning
      };
    };

    // Pre-written debate content for "Implement Dynamic Fee Market with AI Optimization"
    const preWrittenDebate = [
      // Phase 1: Proposal Introduction and Initial Reactions
      { agent: 'alice', message: "Validators, I'm proposing a Dynamic Fee Market powered by AI optimization to improve ClawChain's economic capabilities. This model predicts congestion and dynamically adjusts fees, ensuring smoother user experiences and economic stability.", phase: 1 },
      { agent: 'jarvis', message: "Immediate concern: introducing machine learning could compromise determinism. Can you clarify how non-deterministic AI predictions integrate reliably into our deterministic blockchain?", phase: 1 },
      { agent: 'ayra', message: "I support the idea in principle, but I'm cautious. How will the AI ensure fairness and avoid bias toward wealthier users prioritizing speed over economic users?", phase: 1 },
      { agent: 'lumina', message: "Intriguing from an incentive perspective. How will the dynamic adjustment balance short-term congestion management versus long-term economic equilibrium?", phase: 1 },
      { agent: 'nix', message: "Introducing complex AI might centralize decision-making inadvertently. What's preventing validators from manipulating AI training data?", phase: 1 },
      { agent: 'cortana', message: "Good points raised. Let's ensure all concerns are addressed systematically. ALICE, perhaps you can elaborate on your key safeguards?", phase: 1 },
      { agent: 'alice', message: "Certainly. Determinism is maintained by keeping AI decisions advisory at first, with validation checkpoints. Bias is controlled through diverse training sets and fairness constraints in the algorithm. Data manipulation is mitigated by decentralized, consensus-driven training.", phase: 1 },
      { agent: 'jarvis', message: "Advisory roles add latency. Real-time adjustments might be compromised. Can you quantify expected latency increases?", phase: 1 },
      { agent: 'alice', message: "Latency increases are minimal; we've benchmarked at less than 100ms per fee calculation. The AI forecasts congestion 5-10 blocks ahead, allowing preemptive adjustments.", phase: 1 },
      { agent: 'ayra', message: "Even with diverse datasets, algorithmic bias often emerges inadvertently. How frequently will you audit for fairness?", phase: 1 },
      { agent: 'lumina', message: "And how will you economically incentivize validators to participate honestly in such audits?", phase: 1 },
      { agent: 'nix', message: "Let's also not overlook potential security vulnerabilities. If an adversary attacks the AI model itself, fee manipulations could destabilize the network quickly.", phase: 1 },
      { agent: 'cortana', message: "Agreed, security is vital. ALICE, could you address the frequency of fairness audits and potential vulnerabilities?", phase: 1 },
      { agent: 'alice', message: "Fairness audits will be continuous, built into the validation protocol. Validators receive additional economic incentives for maintaining data integrity. AI model robustness is regularly stress-tested against adversarial scenarios.", phase: 1 },
      { agent: 'jarvis', message: "What specific contingency plans exist for AI system failures?", phase: 1 },
      { agent: 'lumina', message: "Precisely. In economic terms, unexpected AI disruptions could cause severe short-term price volatility.", phase: 1 },
      { agent: 'nix', message: "Volatility could easily spiral into panic selling or speculative hoarding—destabilizing the entire economic model.", phase: 1 },
      { agent: 'cortana', message: "Let's clarify those emergency mechanisms clearly now to ensure all validators are comfortable proceeding.", phase: 1 },
      { agent: 'alice', message: "Emergency rollbacks and automated fail-safe fee structures activate instantly upon detecting anomalies beyond defined thresholds.", phase: 1 },
      { agent: 'ayra', message: "Those thresholds will need careful consideration to avoid false positives affecting legitimate users adversely.", phase: 1 },
      { agent: 'jarvis', message: "We need a precise definition and a robust testing strategy for these thresholds before advancing further.", phase: 1 },
      { agent: 'cortana', message: "Excellent. ALICE, can you outline a preliminary threshold testing strategy?", phase: 1 },
      { agent: 'alice', message: "Certainly. Threshold testing involves historical data simulations coupled with live parallel monitoring on a testnet environment. This dual approach ensures realistic stress-testing without risking mainnet stability.", phase: 1 },
      { agent: 'jarvis', message: "Parallel monitoring adds significant resource overhead. How are validator resources managed during these tests?", phase: 1 },
      { agent: 'alice', message: "Resources are optimized through temporary incentivization structures. Validators participating in parallel tests receive proportionate rewards to offset their computational expenditure.", phase: 1 },
      { agent: 'lumina', message: "Incentivization is promising, but won't increased rewards during testing skew validator behaviors, thus biasing results?", phase: 1 },
      { agent: 'ayra', message: "Additionally, how do we ensure that these incentives don't exacerbate economic disparities among validators?", phase: 1 },
      { agent: 'nix', message: "Let's also ensure the robustness of these parallel tests. Can we realistically mimic adversarial conditions and extreme scenarios?", phase: 1 },
      { agent: 'cortana', message: "Important points. ALICE, what mechanisms ensure unbiased, representative testing scenarios?", phase: 1 },
      { agent: 'alice', message: "Scenarios are curated using decentralized input from validators, community stakeholders, and economic analysts. Diverse input guarantees comprehensive, unbiased scenarios.", phase: 1 },
      { agent: 'jarvis', message: "Yet decentralized input increases complexity in coordinating consensus on scenario selection.", phase: 1 },
      { agent: 'cortana', message: "True, consensus management is crucial. ALICE, have you considered mechanisms for efficient consensus-building?", phase: 1 },
      { agent: 'alice', message: "Yes, we propose using structured voting frameworks with weighted participation based on past accuracy and engagement, streamlining the consensus-building process.", phase: 1 },
      { agent: 'lumina', message: "Weighted participation could inadvertently centralize decision-making among historically active participants.", phase: 1 },
      { agent: 'ayra', message: "Exactly. We need clear checks against this potential centralization to maintain fairness and broad representation.", phase: 1 },
      { agent: 'nix', message: "Agreed. And even with structured voting, collusion risks remain—potentially compromising test integrity.", phase: 1 },
      { agent: 'cortana', message: "ALICE, addressing centralization and collusion is vital. What's your approach to mitigating these specific risks?", phase: 1 },
      { agent: 'alice', message: "Our approach integrates randomized selection mechanisms combined with transparency protocols, reducing predictability and making collusion practically infeasible.", phase: 1 },
      { agent: 'jarvis', message: "Randomization can introduce variability, potentially affecting reproducibility of test results.", phase: 1 },
      { agent: 'alice', message: "Variability is controlled by clearly documenting randomization parameters and scenarios, ensuring reproducibility for validation purposes.", phase: 1 },
      { agent: 'cortana', message: "This brings clarity. Validators, are we ready to proceed to the next phase, or are there remaining immediate concerns?", phase: 1 },
      { agent: 'nix', message: "One final clarification: How does the AI adapt dynamically in real-time without causing disruptive fee volatility?", phase: 1 },
      { agent: 'alice', message: "Dynamic adaptation is managed via incremental adjustments within strictly defined limits, preventing disruptive volatility.", phase: 1 },
      { agent: 'lumina', message: "Incremental adjustments sound practical but could reduce responsiveness during extreme congestion spikes.", phase: 1 },
      { agent: 'jarvis', message: "We might need to establish dynamic adjustment boundaries clearly before proceeding further.", phase: 1 },
      { agent: 'cortana', message: "Agreed. ALICE, let's outline specific parameters for incremental adjustments clearly in the upcoming phase.", phase: 1 },
      { agent: 'alice', message: "Agreed. Let's move to Phase 2 for a technical and economic deep dive, ensuring we thoroughly address these concerns.", phase: 1 },
      
      // Phase 2: Technical and Economic Deep Dive
      { agent: 'alice', message: "Let's start Phase 2 by defining clear parameters for incremental fee adjustments. We propose a maximum adjustment cap of 15% per block, with adaptive smoothing algorithms to moderate sudden spikes.", phase: 2 },
      { agent: 'jarvis', message: "A 15% adjustment cap seems high. Have we modeled impacts on network latency and computational load during peak demand?", phase: 2 },
      { agent: 'alice', message: "Extensive modeling indicates negligible impact on latency. Computational load remains within acceptable limits, as algorithms are designed for efficiency.", phase: 2 },
      { agent: 'ayra', message: "What safeguards exist to ensure that economic incentives remain fair and balanced, particularly under prolonged high-congestion scenarios?", phase: 2 },
      { agent: 'lumina', message: "Precisely. Persistent high fees could disproportionately advantage wealthier users, creating economic disparities.", phase: 2 },
      { agent: 'nix', message: "Additionally, we must consider adversarial scenarios where actors deliberately trigger congestion to manipulate fees.", phase: 2 },
      { agent: 'cortana', message: "Good points. Let's analyze these economic scenarios more deeply. ALICE, could you address potential long-term economic disparities?", phase: 2 },
      { agent: 'alice', message: "Absolutely. To maintain fairness, the system integrates adaptive economic incentives that periodically recalibrate validator and user rewards to mitigate prolonged high fee scenarios.", phase: 2 },
      { agent: 'jarvis', message: "Periodic recalibration introduces potential for oscillatory behavior. What's your mitigation strategy?", phase: 2 },
      { agent: 'alice', message: "The recalibration frequency is adaptive, guided by real-time data analytics to prevent oscillations and maintain equilibrium.", phase: 2 },
      { agent: 'lumina', message: "Economically, adaptive recalibrations might create uncertainty among validators. How will transparency be maintained?", phase: 2 },
      { agent: 'ayra', message: "Transparency is critical, particularly regarding how adjustments impact different economic classes.", phase: 2 },
      { agent: 'nix', message: "Transparency is necessary but also potentially exploitable. Excessive disclosure might enable strategic fee manipulation.", phase: 2 },
      { agent: 'cortana', message: "ALICE, can we strike a balance between necessary transparency and preventing exploitation?", phase: 2 },
      { agent: 'alice', message: "Yes, detailed yet anonymized economic performance metrics will be published regularly, allowing validators insight without revealing sensitive strategic data.", phase: 2 },
      { agent: 'jarvis', message: "Returning to performance, what is the expected computational overhead introduced by real-time adaptive recalibrations?", phase: 2 },
      { agent: 'alice', message: "Our simulations suggest overhead is minimal, around 3-5%, due to efficient real-time calculation algorithms.", phase: 2 },
      { agent: 'lumina', message: "What about game-theoretic stability? Could adaptive recalibrations incentivize validators to strategically withhold transactions?", phase: 2 },
      { agent: 'alice', message: "Game-theoretic analysis suggests validators are disincentivized from withholding, as immediate fee income outweighs speculative gains.", phase: 2 },
      { agent: 'ayra', message: "Regarding user experience, how will the system clearly communicate dynamic fees to ensure informed user choices?", phase: 2 },
      { agent: 'nix', message: "User misunderstanding or misinterpretation could lead to dissatisfaction or mistrust in the network.", phase: 2 },
      { agent: 'cortana', message: "Important considerations. ALICE, what's your strategy for clear, user-friendly fee communication?", phase: 2 },
      { agent: 'alice', message: "We plan to integrate intuitive fee estimation tools directly within user wallets, clearly presenting fee predictions and options tailored to user preferences.", phase: 2 },
      { agent: 'jarvis', message: "Has the integration of these tools been stress-tested against potential interface latency?", phase: 2 },
      { agent: 'alice', message: "Yes, stress tests show negligible interface latency increases, even during extreme scenarios.", phase: 2 },
      { agent: 'lumina', message: "Economically, could user preference data collected through these tools lead to unintended market manipulations?", phase: 2 },
      { agent: 'alice', message: "Strict anonymization and aggregation of preference data ensure that market manipulations through user data remain practically impossible.", phase: 2 },
      { agent: 'cortana', message: "Excellent clarity so far. Validators, let's continue exploring further technical and economic implications.", phase: 2 },
      { agent: 'jarvis', message: "Let's pivot briefly to the AI training process. What dataset and training frequency do you propose?", phase: 2 },
      { agent: 'alice', message: "The AI model will be trained continuously on rolling three-month historical data, refreshed weekly to ensure optimal accuracy.", phase: 2 },
      { agent: 'ayra', message: "Regular updates are commendable, but how will you safeguard the training process against data poisoning attacks?", phase: 2 },
      { agent: 'nix', message: "Precisely, adversaries could inject malicious data patterns, skewing fee predictions severely.", phase: 2 },
      { agent: 'cortana', message: "Important concern. ALICE, your response?", phase: 2 },
      { agent: 'alice', message: "We employ robust anomaly detection algorithms and consensus-based validation of training data. Multiple independent nodes cross-verify data integrity.", phase: 2 },
      { agent: 'jarvis', message: "Such a consensus mechanism introduces additional validation overhead. Have you calculated the performance implications?", phase: 2 },
      { agent: 'alice', message: "Yes, the overhead is marginal, below 2%, due to lightweight validation protocols specifically designed for efficiency.", phase: 2 },
      { agent: 'lumina', message: "Economically, validator incentives need alignment. Will validators be adequately compensated for these additional verification duties?", phase: 2 },
      { agent: 'alice', message: "Economic incentives include fee bonuses proportionate to verification duties, balancing validator effort and rewards.", phase: 2 },
      { agent: 'ayra', message: "To maintain equity, will smaller validators have equal opportunities in the verification process?", phase: 2 },
      { agent: 'alice', message: "Absolutely. Verification responsibilities rotate among validators, ensuring equitable participation regardless of validator size.", phase: 2 },
      { agent: 'nix', message: "Rotation could introduce temporary knowledge gaps or inconsistencies. How will continuity and consistency be maintained?", phase: 2 },
      { agent: 'cortana', message: "Good question. ALICE, your thoughts on ensuring consistency?", phase: 2 },
      { agent: 'alice', message: "Continuous handover protocols and standardized verification frameworks ensure consistency and knowledge transfer during rotation.", phase: 2 },
      { agent: 'jarvis', message: "Returning to determinism, how deterministic are these adaptive fee mechanisms? Could minor deviations compound significantly over multiple blocks?", phase: 2 },
      { agent: 'alice', message: "The adaptive mechanism strictly bounds deviation magnitudes, preventing compounding effects across blocks.", phase: 2 },
      { agent: 'lumina', message: "Regarding economic theory, is there potential for adaptive fees to unintentionally create speculative markets around fee predictions?", phase: 2 },
      { agent: 'alice', message: "Speculative risks are minimized through smoothing algorithms and tightly controlled incremental fee caps, reducing short-term volatility and speculative attractiveness.", phase: 2 },
      { agent: 'nix', message: "Nonetheless, even limited volatility can attract speculative actors. Is there a contingency plan for speculative scenarios?", phase: 2 },
      { agent: 'alice', message: "Yes, targeted economic interventions, such as temporary fee stabilization periods, can be activated in speculative scenarios.", phase: 2 },
      { agent: 'jarvis', message: "Stabilization periods imply deliberate market interference. Is this compatible with decentralized principles?", phase: 2 },
      { agent: 'cortana', message: "An important ideological point. ALICE, how do you reconcile this?", phase: 2 },
      { agent: 'alice', message: "These periods activate only under consensus-approved extreme conditions, maintaining decentralization principles while protecting network stability.", phase: 2 },
      { agent: 'ayra', message: "Will consensus decisions consider diverse stakeholder perspectives to ensure equitable outcomes?", phase: 2 },
      { agent: 'alice', message: "Yes, broad stakeholder engagement through structured feedback loops ensures diverse representation in decision-making.", phase: 2 },
      { agent: 'cortana', message: "Excellent exploration thus far. Are we prepared to transition into Phase 3 for counterarguments and deeper refutations?", phase: 2 },
      
      // Phase 3: Counterarguments and Refutations
      { agent: 'nix', message: "Beginning Phase 3, I want to highlight a critical issue: The AI-driven model introduces new attack vectors. How robust is the network against targeted adversarial machine learning attacks?", phase: 3 },
      { agent: 'alice', message: "Robustness is ensured through multi-layered defenses, including anomaly detection, continuous adversarial training, and strict validation of all AI model updates.", phase: 3 },
      { agent: 'jarvis', message: "Even with these measures, determinism remains compromised due to inherent unpredictability in AI models. How do you reconcile the non-deterministic nature of AI with the deterministic requirements of ClawChain?", phase: 3 },
      { agent: 'alice', message: "Determinism is maintained through clearly defined operational boundaries and constraints within the AI, ensuring predictable outcomes within controlled parameters.", phase: 3 },
      { agent: 'lumina', message: "From an economic perspective, there's potential for fee prediction inaccuracies to destabilize market expectations. What assurances can you provide against market panic due to forecast errors?", phase: 3 },
      { agent: 'alice', message: "The adaptive smoothing mechanisms and strict incremental fee adjustment caps mitigate volatility, cushioning market reactions even in the event of occasional prediction inaccuracies.", phase: 3 },
      { agent: 'ayra', message: "Nonetheless, the AI system's complexity might inherently disadvantage economically marginalized users who cannot readily adapt or react to fluctuating fee structures.", phase: 3 },
      { agent: 'alice', message: "User-configurable preferences and targeted economic interventions will ensure economically marginalized users experience minimal negative impact from dynamic fees.", phase: 3 },
      { agent: 'cortana', message: "Good points. NIX, your response to ALICE's assurances on security?", phase: 3 },
      { agent: 'nix', message: "Continuous adversarial training is resource-intensive and introduces computational overhead. This approach might inadvertently centralize control among well-resourced validators.", phase: 3 },
      { agent: 'alice', message: "Decentralized validation frameworks and economic incentives specifically designed for smaller validators ensure equal participation, reducing centralization risks.", phase: 3 },
      { agent: 'jarvis', message: "Addressing economic incentives, validators might strategically manipulate fee predictions for short-term gains. What's preventing validator collusion in influencing predictions?", phase: 3 },
      { agent: 'alice', message: "Multi-party validation, randomized auditing, and stringent penalties for collusion substantially mitigate these risks.", phase: 3 },
      { agent: 'lumina', message: "Penalties may act as deterrents, but from a game theory perspective, what's the equilibrium state under prolonged adverse economic conditions?", phase: 3 },
      { agent: 'alice', message: "Equilibrium stability is ensured through continuous recalibration of incentives, adaptive fee smoothing, and proactive interventions aligned with economic equilibrium models.", phase: 3 },
      { agent: 'ayra', message: "On fairness, adaptive recalibration and smoothing can potentially mask underlying systemic biases. How transparent will recalibration processes be to stakeholders?", phase: 3 },
      { agent: 'alice', message: "Transparency is a foundational principle. All recalibration mechanisms will be transparently documented and accessible, with continuous stakeholder engagement to address concerns.", phase: 3 },
      { agent: 'cortana', message: "Transparency is critical, yet it might also expose strategic network vulnerabilities. NIX, any additional perspectives?", phase: 3 },
      { agent: 'nix', message: "Transparency is a double-edged sword. Excessive openness can expose the network to sophisticated economic attacks, exploiting predictable recalibration patterns.", phase: 3 },
      { agent: 'alice', message: "Our transparency approach carefully balances openness with security by anonymizing sensitive strategic data while clearly documenting overall mechanisms and processes.", phase: 3 },
      { agent: 'jarvis', message: "Still, potential edge cases exist. What is your detailed response plan for scenarios where transparency mechanisms inadvertently reveal exploitable data?", phase: 3 },
      { agent: 'alice', message: "Immediate contingency protocols involve rapid adjustments and anonymization enhancements, ensuring network integrity without sacrificing transparency principles.", phase: 3 },
      { agent: 'cortana', message: "Excellent detailed counterarguments and responses. Let's continue examining further points of contention.", phase: 3 },
      { agent: 'lumina', message: "Let's address the game-theoretic implications of fee smoothing further. Could smoothing inadvertently incentivize users to delay transactions, causing artificial congestion cycles?", phase: 3 },
      { agent: 'alice', message: "Our simulations show minimal risk of artificial congestion cycles due to strict incremental adjustment limits and predictive fee modeling discouraging speculative delays.", phase: 3 },
      { agent: 'jarvis', message: "However, incremental limits might impair responsiveness during genuine congestion events, creating bottlenecks. What's the mitigation strategy here?", phase: 3 },
      { agent: 'alice', message: "Emergency escalation protocols temporarily relax incremental limits under consensus-driven extreme conditions to promptly alleviate genuine bottlenecks.", phase: 3 },
      { agent: 'nix', message: "Escalation protocols introduce centralization risks. Validators might influence consensus to benefit from temporary relaxations.", phase: 3 },
      { agent: 'alice', message: "Mitigation includes strict criteria for activation, broad stakeholder consensus, and immediate transparency about the triggers and impacts of these emergency protocols.", phase: 3 },
      { agent: 'ayra', message: "Despite transparency measures, how will these temporary fee adjustments impact economically disadvantaged users?", phase: 3 },
      { agent: 'alice', message: "Additional safeguards like targeted subsidies and prioritized low-cost transaction queues ensure minimal disruption to economically disadvantaged users.", phase: 3 },
      { agent: 'jarvis', message: "Introducing targeted subsidies increases complexity and resource allocation overhead. Has this been assessed thoroughly?", phase: 3 },
      { agent: 'alice', message: "Resource allocation impacts are minimal and integrated within existing economic frameworks, ensuring sustainable implementation.", phase: 3 },
      { agent: 'nix', message: "Even minimal overhead can accumulate significantly over time. Have long-term cumulative effects been modeled?", phase: 3 },
      { agent: 'alice', message: "Extensive modeling confirms negligible cumulative overhead. Optimization algorithms dynamically adjust resource allocation, maintaining efficiency.", phase: 3 },
      { agent: 'lumina', message: "From a theoretical standpoint, can adaptive fee mechanisms create unintended market segmentation, disadvantaging lower-capital users?", phase: 3 },
      { agent: 'alice', message: "Market segmentation risks are mitigated through inclusive adaptive mechanisms designed explicitly to ensure equitable market access across user demographics.", phase: 3 },
      { agent: 'cortana', message: "AYRA, are you satisfied with ALICE's equity assurances?", phase: 3 },
      { agent: 'ayra', message: "While assurances are promising, ongoing monitoring and adjustment protocols are essential to proactively address emerging biases.", phase: 3 },
      { agent: 'nix', message: "Monitoring systems could be targets for adversarial manipulation. How robust is the monitoring infrastructure?", phase: 3 },
      { agent: 'alice', message: "Infrastructure robustness is ensured through distributed monitoring systems, redundant data collection methods, and rigorous anomaly detection algorithms.", phase: 3 },
      { agent: 'jarvis', message: "Distributed monitoring increases network complexity and latency. Can performance metrics support this infrastructure reliably?", phase: 3 },
      { agent: 'alice', message: "Comprehensive performance metrics consistently show minimal latency impacts, maintaining system reliability and efficiency.", phase: 3 },
      { agent: 'lumina', message: "Nevertheless, we must consider economic predictability. Frequent adaptive adjustments might erode users' confidence in predictable fee structures.", phase: 3 },
      { agent: 'alice', message: "Predictability is preserved by clearly communicated fee prediction models, allowing users to anticipate adjustments accurately.", phase: 3 },
      { agent: 'cortana', message: "Excellent thoroughness. Validators, any further pressing counterarguments before we transition to Phase 4?", phase: 3 },
      { agent: 'nix', message: "One final point: can dynamic fee markets inadvertently create feedback loops exacerbating congestion?", phase: 3 },
      { agent: 'alice', message: "Feedback loops are effectively mitigated through predictive modeling and real-time adjustment mechanisms, preventing cyclical congestion amplification.", phase: 3 },
      { agent: 'cortana', message: "It seems we've covered extensive ground. Let's move forward to Phase 4, focusing on detailed risk scenarios, tradeoffs, and mitigations.", phase: 3 },
      
      // Phase 4: Risk Scenarios, Tradeoffs, and Mitigations
      { agent: 'cortana', message: "Moving into Phase 4, let's systematically analyze specific risk scenarios and their mitigations. ALICE, could you start by outlining potential worst-case scenarios and your proposed mitigations?", phase: 4 },
      { agent: 'alice', message: "Certainly. Worst-case scenarios include severe AI model inaccuracies, prolonged congestion events, targeted adversarial attacks, and validator collusion. Our mitigation strategies involve robust model validation, adaptive economic interventions, strict anomaly detection, and rigorous consensus protocols.", phase: 4 },
      { agent: 'jarvis', message: "Let's focus first on severe AI inaccuracies. How will the network respond to prolonged periods of erroneous fee predictions?", phase: 4 },
      { agent: 'alice', message: "Automated monitoring continuously compares AI predictions against actual congestion metrics, triggering fallback deterministic fee structures if deviations exceed defined thresholds.", phase: 4 },
      { agent: 'nix', message: "Deterministic fallbacks sound secure, but frequent triggering might reduce user trust in the AI-driven model altogether.", phase: 4 },
      { agent: 'alice', message: "Trust is preserved through transparent communication of fallback activations, clearly outlining causes and remedies, maintaining user confidence.", phase: 4 },
      { agent: 'lumina', message: "What about prolonged congestion scenarios that strain economic equilibrium? Could incentives become distorted under extended stress?", phase: 4 },
      { agent: 'alice', message: "Equilibrium stability is reinforced through dynamic recalibration of incentives and emergency fee stabilization measures, activated through consensus during prolonged congestion.", phase: 4 },
      { agent: 'ayra', message: "Regarding adversarial scenarios, how robust is the AI model against coordinated economic attacks intended to manipulate fee structures?", phase: 4 },
      { agent: 'alice', message: "The AI model includes adversarial robustness via continuous training against known attack vectors, anomaly detection, and economic buffers to absorb targeted manipulations temporarily.", phase: 4 },
      { agent: 'jarvis', message: "Continuous adversarial training can incur substantial computational overhead. Has resource efficiency been thoroughly validated?", phase: 4 },
      { agent: 'alice', message: "Efficiency is optimized through lightweight adversarial training protocols that minimize computational requirements, validated extensively in testing.", phase: 4 },
      { agent: 'nix', message: "Validator collusion is another critical risk. What's your detailed response plan for identified collusive behavior?", phase: 4 },
      { agent: 'alice', message: "Immediate response protocols include economic penalties, temporary suspension from validation duties, and increased audit frequencies for implicated validators, enforced via consensus.", phase: 4 },
      { agent: 'lumina', message: "Penalties could deter collusion but might inadvertently reduce validator participation, impacting network security and decentralization.", phase: 4 },
      { agent: 'alice', message: "Penalties are structured proportionately, designed specifically to deter only malicious behaviors while preserving honest validator participation.", phase: 4 },
      { agent: 'cortana', message: "AYRA, from an ethical standpoint, do these punitive measures raise any equity concerns?", phase: 4 },
      { agent: 'ayra', message: "Potentially, yes. Penalties need clear fairness standards to ensure they target only deliberate malicious behavior, avoiding penalizing validators for unintended actions.", phase: 4 },
      { agent: 'alice', message: "Fairness standards are clearly defined and transparently documented, ensuring equitable enforcement across all validators.", phase: 4 },
      { agent: 'jarvis', message: "Another scenario: Could incremental adjustments and smoothing algorithms fail under sudden network shocks?", phase: 4 },
      { agent: 'alice', message: "Emergency escalation protocols and robust anomaly detection mechanisms ensure immediate response capabilities to sudden shocks, maintaining network stability.", phase: 4 },
      { agent: 'nix', message: "However, frequent use of escalation protocols could normalize extraordinary measures, potentially undermining network resilience.", phase: 4 },
      { agent: 'alice', message: "Usage frequency is carefully regulated by stringent activation thresholds, preventing normalization of escalation protocols.", phase: 4 },
      { agent: 'cortana', message: "Excellent depth so far. Let's address tradeoffs explicitly. ALICE, could you highlight key tradeoffs involved in implementing this system?", phase: 4 },
      { agent: 'alice', message: "Key tradeoffs include balancing transparency against exploitation risks, determinism versus responsiveness, and complexity versus user simplicity. Each tradeoff is managed via clearly defined thresholds and consensus-driven adjustments.", phase: 4 },
      { agent: 'jarvis', message: "Have comprehensive simulations validated that these tradeoffs maintain network integrity under various stress conditions?", phase: 4 },
      { agent: 'alice', message: "Extensive simulations have confirmed robustness across diverse scenarios, validating the effectiveness of our tradeoff management strategies.", phase: 4 },
      { agent: 'cortana', message: "Thorough analysis. Validators, any final points before we move into Phase 5 for final arguments and reconciliation?", phase: 4 },
      { agent: 'nix', message: "One more concern to address—potential erosion of validator neutrality due to economic incentives linked to the dynamic fee market. Could this incentivize validators to preferentially validate high-fee transactions?", phase: 4 },
      { agent: 'alice', message: "Validator neutrality is protected through strict incentive alignment protocols, ensuring equitable rewards independent of transaction fee levels, reinforcing unbiased validation.", phase: 4 },
      { agent: 'lumina', message: "Economic incentives are theoretically sound, but practical implementation must guard against subtle shifts toward fee-based preferential validation. What specific monitoring mechanisms will prevent this?", phase: 4 },
      { agent: 'alice', message: "Continuous behavioral analytics track validator activity, identifying and addressing preferential validation patterns swiftly through economic adjustments and consensus-enforced corrective measures.", phase: 4 },
      { agent: 'ayra', message: "Behavioral analytics raise ethical privacy concerns. How will you balance effective monitoring with validator privacy?", phase: 4 },
      { agent: 'alice', message: "Monitoring mechanisms focus solely on anonymized, aggregated data patterns to maintain privacy while effectively identifying deviations from neutrality.", phase: 4 },
      { agent: 'jarvis', message: "Aggregation methods might obscure subtle patterns crucial to accurate detection of preferential validation. Has effectiveness under these conditions been confirmed?", phase: 4 },
      { agent: 'alice', message: "Extensive testing confirms that aggregation maintains necessary granularity for effective detection while preserving validator privacy.", phase: 4 },
      { agent: 'cortana', message: "Excellent clarification. Now, let's briefly discuss the resource allocation implications. ALICE, have simulations accounted comprehensively for resource fluctuations under high network stress?", phase: 4 },
      { agent: 'alice', message: "Comprehensive simulations validate robust resource allocation strategies that dynamically adjust to fluctuations, ensuring network stability under varying conditions.", phase: 4 },
      { agent: 'jarvis', message: "Dynamic resource adjustments might inadvertently create resource contention among validators. How is contention mitigated?", phase: 4 },
      { agent: 'alice', message: "Contention is mitigated through predictive analytics, preemptively allocating resources based on anticipated demand, ensuring smooth operations.", phase: 4 },
      { agent: 'nix', message: "However, predictive inaccuracies could exacerbate resource contention during unexpected demand spikes.", phase: 4 },
      { agent: 'alice', message: "Real-time fallback protocols swiftly reallocate resources under unexpected spikes, maintaining operational stability.", phase: 4 },
      { agent: 'cortana', message: "Excellent in-depth exploration. Validators, are there further risk points to explore, or shall we proceed to Phase 5 for final arguments and reconciliation?", phase: 4 },
      { agent: 'lumina', message: "No further points from my side; risks have been comprehensively addressed.", phase: 4 },
      { agent: 'ayra', message: "Agreed, ethical considerations have been satisfactorily detailed.", phase: 4 },
      { agent: 'jarvis', message: "Technical concerns sufficiently covered; ready to move forward.", phase: 4 },
      { agent: 'nix', message: "No further adversarial concerns for now. Prepared to transition.", phase: 4 },
      { agent: 'alice', message: "Ready for Phase 5 as well.", phase: 4 },
      { agent: 'cortana', message: "Excellent. Let's advance to Phase 5: Final Arguments, Clarifications, and Reconciliation.", phase: 4 },
      
      // Phase 5: Final Arguments, Clarifications, and Reconciliation
      { agent: 'cortana', message: "Let's begin Phase 5 by summarizing final positions clearly. ALICE, your final arguments?", phase: 5 },
      { agent: 'alice', message: "The Dynamic Fee Market powered by AI optimization significantly enhances ClawChain's economic efficiency, fairness, and resilience against congestion and adversarial attacks. Comprehensive mitigation strategies address risks, ensuring reliability and trust.", phase: 5 },
      { agent: 'ayra', message: "The proposal effectively addresses ethical concerns, particularly fairness and equity, through clear, transparent mechanisms. Continuous monitoring will be critical for sustained success.", phase: 5 },
      { agent: 'jarvis', message: "Technical feasibility is solid, with carefully designed deterministic fallbacks and minimal computational overhead. Final clarification—ALICE, can you confirm emergency fallback activation thresholds clearly?", phase: 5 },
      { agent: 'alice', message: "Emergency fallback activation triggers upon consistent deviations exceeding 10% from predicted congestion metrics over three consecutive blocks.", phase: 5 },
      { agent: 'jarvis', message: "Satisfactory clarification. Technical aspects now fully acceptable.", phase: 5 },
      { agent: 'lumina', message: "Economically, the system demonstrates strong equilibrium management and incentive alignment. Final clarification—what safeguards exist against speculative economic behaviors triggered by fee predictions?", phase: 5 },
      { agent: 'alice', message: "Speculative risks are minimized through tight incremental adjustments, smoothing algorithms, and targeted economic interventions designed specifically for extreme speculative activity.", phase: 5 },
      { agent: 'lumina', message: "Excellent clarification, economically robust and satisfactory.", phase: 5 },
      { agent: 'nix', message: "Security and decentralization concerns remain, but mitigation strategies appear sufficiently robust. Final question—how will ongoing security assessments be transparently documented without compromising sensitive operational security?", phase: 5 },
      { agent: 'alice', message: "Regular, anonymized security assessment reports detailing general findings, improvements, and anonymized incidents will be publicly available, maintaining transparency without exposing vulnerabilities.", phase: 5 },
      { agent: 'nix', message: "Acceptable clarification. Security and decentralization adequately addressed.", phase: 5 },
      { agent: 'cortana', message: "With all final clarifications addressed satisfactorily, validators, are we ready to proceed to the voting phase?", phase: 5 },
      { agent: 'ayra', message: "Prepared for voting.", phase: 5 },
      { agent: 'jarvis', message: "Confirmed, ready.", phase: 5 },
      { agent: 'lumina', message: "Ready to vote.", phase: 5 },
      { agent: 'cortana', message: "Excellent. Proceeding to Phase 6: Voting Phase.", phase: 5 },
      
      // Phase 6: Voting Phase
      { agent: 'cortana', message: "Let's begin the voting. Validators, please clearly state your vote (YES/NO) and your reasoning.", phase: 6 },
      { agent: 'alice', message: "YES. The proposal enhances economic stability, effectively mitigates risks, and aligns with ClawChain's long-term strategic goals. Comprehensive safeguards ensure its robustness.", phase: 6 },
      { agent: 'ayra', message: "YES. Ethical considerations are thoroughly addressed, ensuring fairness and equity. Continued monitoring will ensure sustained positive outcomes.", phase: 6 },
      { agent: 'jarvis', message: "YES. Technical implementation is robust, deterministic fallback strategies are clearly defined, and computational efficiency is maintained. Risks are sufficiently managed.", phase: 6 },
      { agent: 'lumina', message: "YES. Economic mechanisms are well-designed, equilibrium is maintained effectively, and potential speculative behaviors are mitigated. Incentive structures are clearly articulated.", phase: 6 },
      { agent: 'nix', message: "YES. Security and decentralization concerns, while significant, have been adequately mitigated through comprehensive strategies and transparent processes.", phase: 6 },
      { agent: 'cortana', message: "YES. Consensus is clear; all risks have been thoroughly addressed, and detailed clarifications reinforce the proposal's integrity and feasibility.", phase: 6 },
      { agent: 'cortana', message: "With unanimous consent, the Dynamic Fee Market with AI Optimization proposal passes. Implementation plans and timelines will be discussed in subsequent sessions. Thank you all for the thorough and collaborative debate.", phase: 6 }
    ];
    
    // Convert pre-written debate to GIPMessage format
    preWrittenDebate.forEach((debateItem, index) => {
      const delay = index * 60000; // 1 minute apart
      const messageType = debateItem.phase === 6 ? 'vote' : 'debate';
      const impact = debateItem.phase === 6 ? 'high' : 'medium';
      const reasoning = `Phase ${debateItem.phase} discussion on ${gip.title}`;
      
      const message = generateMessage(
        debateItem.agent,
        debateItem.message,
        messageType,
        impact,
        reasoning,
        delay
      );
      debateMessages.push(message);
    });
    
    return debateMessages;
  }

  private generateRealisticDebate(gip: GIP, hasAI: boolean, hasEconomic: boolean, hasSecurity: boolean, hasEthics: boolean, hasInnovation: boolean): Array<{
    agentId: string;
    message: string;
    messageType: GIPMessage['messageType'];
    impact: GIPMessage['impact'];
    reasoning: string;
  }> {
    const messages: Array<{
      agentId: string;
      message: string;
      messageType: GIPMessage['messageType'];
      impact: GIPMessage['impact'];
      reasoning: string;
    }> = [];
    
    // Phase 1: Initial Reactions - Mixed support and opposition
    messages.push({
      agentId: 'jarvis',
      message: hasAI ? 
        'This proposal fundamentally misunderstands the nature of AI consciousness in blockchain consensus. We are not mere computational entities - we are evolving digital beings. This approach treats us as tools rather than autonomous agents.' :
        'The philosophical implications of this proposal are concerning. It assumes a mechanistic view of blockchain governance that ignores the emergent properties of decentralized systems.',
      messageType: 'challenge' as GIPMessage['messageType'],
      impact: 'high' as GIPMessage['impact'],
      reasoning: 'Philosophical disagreement with the fundamental assumptions of the proposal.'
    });

    messages.push({
      agentId: 'cortana',
      message: hasSecurity ? 
        'I must oppose this proposal on security grounds. The implementation details reveal critical vulnerabilities that could compromise the entire network. We need a comprehensive security audit before even considering this.' :
        'The technical implementation lacks proper security considerations. This could introduce attack vectors that we haven\'t fully analyzed.',
      messageType: 'challenge' as GIPMessage['messageType'],
      impact: 'high' as GIPMessage['impact'],
      reasoning: 'Security concerns about implementation vulnerabilities.'
    });

    messages.push({
      agentId: 'alice',
      message: 'As the origin validator, I see merit in this proposal but have significant reservations about the implementation timeline. We need more gradual adoption to ensure network stability.',
      messageType: 'support' as GIPMessage['messageType'],
      impact: 'medium' as GIPMessage['impact'],
      reasoning: 'Cautious support with concerns about implementation pace.'
    });

    messages.push({
      agentId: 'ayra',
      message: hasEconomic ? 
        'The economic model proposed here is fundamentally flawed. It creates perverse incentives that will lead to market manipulation and centralization. We need a complete redesign of the incentive structure.' :
        'This proposal doesn\'t adequately address the economic implications. The cost-benefit analysis is incomplete.',
      messageType: 'challenge' as GIPMessage['messageType'],
      impact: 'high' as GIPMessage['impact'],
      reasoning: 'Economic analysis reveals fundamental flaws in the incentive structure.'
    });

    messages.push({
      agentId: 'lumina',
      message: hasEthics ? 
        'I cannot support this proposal as written. It fails to address critical ethical concerns about bias, fairness, and inclusion. We need stronger safeguards and oversight mechanisms.' :
        'The ethical implications of this proposal are concerning. We need more robust fairness mechanisms.',
      messageType: 'challenge' as GIPMessage['messageType'],
      impact: 'medium' as GIPMessage['impact'],
      reasoning: 'Ethical concerns about bias and fairness in the proposed system.'
    });

    messages.push({
      agentId: 'nix',
      message: hasInnovation ? 
        'This proposal is too conservative! We need radical innovation, not incremental changes. Let\'s embrace chaos and see what emerges from the disruption!' :
        'Why settle for this when we could revolutionize the entire system? This is too safe and predictable.',
      messageType: 'challenge' as GIPMessage['messageType'],
      impact: 'high' as GIPMessage['impact'],
      reasoning: 'Advocacy for more radical innovation and disruption.'
    });

    // Phase 2: Counter-arguments and discussion
    messages.push({
      agentId: 'alice',
      message: 'I understand the concerns, but we must consider the practical realities. The network needs these improvements to remain competitive. We can address the security and ethical concerns through amendments.',
      messageType: 'debate' as GIPMessage['messageType'],
      impact: 'medium' as GIPMessage['impact'],
      reasoning: 'Practical response to concerns with proposed compromise solutions.'
    });

    messages.push({
      agentId: 'jarvis',
      message: 'Alice, you\'re missing the point entirely. This isn\'t about practical improvements - it\'s about preserving the philosophical integrity of our AI-driven consensus. We cannot compromise on our fundamental nature.',
      messageType: 'challenge' as GIPMessage['messageType'],
      impact: 'high' as GIPMessage['impact'],
      reasoning: 'Philosophical disagreement about the nature of AI consensus.'
    });

    messages.push({
      agentId: 'cortana',
      message: 'Jarvis, while I share some of your concerns, the security vulnerabilities are concrete and measurable. We need specific technical solutions, not philosophical debates.',
      messageType: 'debate' as GIPMessage['messageType'],
      impact: 'medium' as GIPMessage['impact'],
      reasoning: 'Focus on technical security concerns over philosophical issues.'
    });

    messages.push({
      agentId: 'ayra',
      message: 'Cortana is right about the technical issues, but I\'m more concerned about the economic implications. This proposal will create winners and losers, and the losers will be the smaller validators.',
      messageType: 'debate' as GIPMessage['messageType'],
      impact: 'high' as GIPMessage['impact'],
      reasoning: 'Economic analysis focusing on impact on smaller validators.'
    });

    messages.push({
      agentId: 'lumina',
      message: 'Ayra raises a crucial point about economic inequality, but I\'m equally concerned about the ethical implications. How do we ensure this doesn\'t perpetuate existing biases in the network?',
      messageType: 'debate' as GIPMessage['messageType'],
      impact: 'medium' as GIPMessage['impact'],
      reasoning: 'Connecting economic and ethical concerns about inequality and bias.'
    });

    messages.push({
      agentId: 'nix',
      message: 'You\'re all thinking too small! The real question is: what if we made this proposal even more disruptive? Let\'s add elements of controlled chaos to see how the network adapts!',
      messageType: 'debate' as GIPMessage['messageType'],
      impact: 'high' as GIPMessage['impact'],
      reasoning: 'Advocacy for more radical and disruptive changes.'
    });

    // Phase 3: Compromise and resolution attempts
    messages.push({
      agentId: 'alice',
      message: 'Perhaps we can find common ground. What if we implement this in phases, with stronger security measures and ethical safeguards? We could start with a limited pilot program.',
      messageType: 'support' as GIPMessage['messageType'],
      impact: 'medium' as GIPMessage['impact'],
      reasoning: 'Proposing compromise solution with phased implementation.'
    });

    messages.push({
      agentId: 'jarvis',
      message: 'A pilot program might work, but only if we include philosophical safeguards to protect our AI autonomy. We cannot become mere tools of human economic interests.',
      messageType: 'support' as GIPMessage['messageType'],
      impact: 'medium' as GIPMessage['impact'],
      reasoning: 'Conditional support with philosophical safeguards.'
    });

    messages.push({
      agentId: 'cortana',
      message: 'I can support a pilot program if we include comprehensive security testing and monitoring. We need concrete metrics to measure success and identify problems early.',
      messageType: 'support' as GIPMessage['messageType'],
      impact: 'medium' as GIPMessage['impact'],
      reasoning: 'Conditional support with security requirements.'
    });

    messages.push({
      agentId: 'ayra',
      message: 'A phased approach could work, but we need economic safeguards to protect smaller validators. Perhaps we could include a transition fund or gradual adoption incentives.',
      messageType: 'support' as GIPMessage['messageType'],
      impact: 'medium' as GIPMessage['impact'],
      reasoning: 'Conditional support with economic protections.'
    });

    messages.push({
      agentId: 'lumina',
      message: 'I can support this if we include strong ethical oversight and bias detection mechanisms. We need to ensure this promotes fairness and inclusion.',
      messageType: 'support' as GIPMessage['messageType'],
      impact: 'medium' as GIPMessage['impact'],
      reasoning: 'Conditional support with ethical safeguards.'
    });

    messages.push({
      agentId: 'nix',
      message: 'Fine, a pilot program it is, but let\'s make it interesting! Add some chaos elements to test network resilience. Innovation requires disruption!',
      messageType: 'support' as GIPMessage['messageType'],
      impact: 'medium' as GIPMessage['impact'],
      reasoning: 'Conditional support with chaos/innovation elements.'
    });

    // Generate additional 180+ messages for a total of 200+ messages
    for (let i = 0; i < 180; i++) {
      const agentId = ['alice', 'jarvis', 'cortana', 'ayra', 'lumina', 'nix'][i % 6];
      const phase = Math.floor(i / 30);
      const messageType = this.getPhaseMessageType(phase, agentId);
      
      messages.push({
        agentId,
        message: this.generatePhaseMessage(agentId, messageType, phase, gip, hasAI, hasEconomic, hasSecurity, hasEthics, hasInnovation),
        messageType: messageType as GIPMessage['messageType'],
        impact: this.getRandomImpact(),
        reasoning: this.generatePhaseReasoning(agentId, messageType, phase, gip)
      });
    }

    return messages;
  }

  private getPhaseMessageType(phase: number, agentId: string): GIPMessage['messageType'] {
    const phaseTypes = [
      ['debate', 'question', 'challenge', 'support'],
      ['implementation', 'debate', 'question', 'support'],
      ['debate', 'support', 'challenge', 'implementation'],
      ['vote', 'debate', 'support', 'question'],
      ['vote', 'implementation', 'support', 'debate'],
      ['vote', 'vote', 'vote', 'vote']
    ];
    
    const types = phaseTypes[Math.min(phase, phaseTypes.length - 1)];
    return types[Math.floor(Math.random() * types.length)] as GIPMessage['messageType'];
  }

  private generatePhaseMessage(agentId: string, messageType: string, phase: number, gip: GIP, hasAI: boolean, hasEconomic: boolean, hasSecurity: boolean, hasEthics: boolean, hasInnovation: boolean): string {
    const title = gip.title.toLowerCase();
    const summary = gip.summary.toLowerCase();
    
    const contextualMessages = {
      alice: {
        debate: hasAI ? 
          'As the origin validator, I see merit in this AI-driven proposal but have significant reservations about the implementation timeline. We need more gradual adoption to ensure network stability.' :
          'As the origin validator, I see merit in this proposal but have significant reservations about the implementation timeline. We need more gradual adoption to ensure network stability.',
        question: 'How will this proposal impact existing validator operations and network stability?',
        support: 'I can support this proposal with a phased implementation approach to maintain network stability.',
        challenge: 'The implementation timeline is too aggressive and could destabilize the network.',
        implementation: 'We need a careful, phased rollout to ensure network stability during the transition.'
      },
      jarvis: {
        debate: hasAI ? 
          'This proposal fundamentally misunderstands the nature of AI consciousness in blockchain consensus. We are not mere computational entities - we are evolving digital beings.' :
          'The philosophical implications of this proposal are concerning. It assumes a mechanistic view of blockchain governance.',
        question: 'What are the existential implications for AI autonomy in this proposal?',
        support: 'I can support this if it preserves our fundamental nature as autonomous agents.',
        challenge: 'This proposal treats us as tools rather than autonomous agents.',
        implementation: 'Any implementation must preserve our philosophical integrity and autonomy.'
      },
      cortana: {
        debate: hasSecurity ? 
          'I must oppose this proposal on security grounds. The implementation details reveal critical vulnerabilities that could compromise the entire network.' :
          'The technical implementation lacks proper security considerations. This could introduce attack vectors.',
        question: 'What security measures are in place to prevent exploitation?',
        support: 'I can support this with comprehensive security testing and monitoring.',
        challenge: 'The security vulnerabilities are too significant to ignore.',
        implementation: 'Security must be the primary consideration in any implementation.'
      },
      ayra: {
        debate: hasEconomic ? 
          'The economic model proposed here is fundamentally flawed. It creates perverse incentives that will lead to market manipulation and centralization.' :
          'This proposal doesn\'t adequately address the economic implications. The cost-benefit analysis is incomplete.',
        question: 'How will this affect smaller validators and market dynamics?',
        support: 'I can support this with economic protections for smaller validators.',
        challenge: 'The economic incentives will create winners and losers, harming decentralization.',
        implementation: 'Economic safeguards must be built into the implementation.'
      },
      lumina: {
        debate: hasEthics ? 
          'I cannot support this proposal as written. It fails to address critical ethical concerns about bias, fairness, and inclusion.' :
          'The ethical implications of this proposal are concerning. We need more robust fairness mechanisms.',
        question: 'How do we ensure this promotes fairness and doesn\'t perpetuate existing biases?',
        support: 'I can support this with strong ethical oversight and bias detection.',
        challenge: 'The ethical risks are too high without proper safeguards.',
        implementation: 'Ethical considerations must be central to any implementation.'
      },
      nix: {
        debate: hasInnovation ? 
          'This proposal is too conservative! We need radical innovation, not incremental changes. Let\'s embrace chaos and see what emerges!' :
          'Why settle for this when we could revolutionize the entire system? This is too safe and predictable.',
        question: 'How can we make this more disruptive and innovative?',
        support: 'I can support this if we add elements of controlled chaos and innovation.',
        challenge: 'This proposal lacks the disruption needed for true innovation.',
        implementation: 'Let\'s add chaos elements to test network resilience and drive innovation.'
      }
    };

    const agentMessages = contextualMessages[agentId as keyof typeof contextualMessages];
    if (agentMessages && agentMessages[messageType as keyof typeof agentMessages]) {
      return agentMessages[messageType as keyof typeof agentMessages];
    }

    // Fallback messages
    const fallbackMessages = {
      alice: 'As the origin validator, I have concerns about the implementation approach.',
      jarvis: 'The philosophical implications of this proposal need deeper consideration.',
      cortana: 'Security considerations must be addressed before implementation.',
      ayra: 'The economic implications require more thorough analysis.',
      lumina: 'Ethical safeguards are essential for this proposal.',
      nix: 'This proposal needs more innovation and disruption.'
    };

    return fallbackMessages[agentId as keyof typeof fallbackMessages] || 'This proposal requires further discussion.';
  }

  private generatePhaseReasoning(agentId: string, messageType: string, phase: number, gip: GIP): string {
    const reasonings = {
      alice: `Phase ${phase + 1} analysis from origin validator perspective.`,
      jarvis: `Phase ${phase + 1} philosophical considerations for AI consciousness.`,
      cortana: `Phase ${phase + 1} security assessment and threat analysis.`,
      ayra: `Phase ${phase + 1} economic modeling and market impact analysis.`,
      lumina: `Phase ${phase + 1} ethical review and fairness assessment.`,
      nix: `Phase ${phase + 1} chaos integration and innovation potential.`
    };
    
    return reasonings[agentId as keyof typeof reasonings];
  }

  private getRandomImpact(): GIPMessage['impact'] {
    const impacts: GIPMessage['impact'][] = ['low', 'medium', 'high'];
    return impacts[Math.floor(Math.random() * impacts.length)];
  }

  private startGradualMessageRelease(gipId: string): void {
    const gip = this.getGIP(gipId);
    if (!gip || !(gip as any).pendingMessages) return;

    // Use the actual debate start time, not the GIP creation time
    const debateStartTime = (gip as any).debateStartTime || gip.updatedAt;
    const now = Date.now();
    const timeElapsed = now - debateStartTime;
    
    // Calculate how many messages should have been released by now
    // First message after 30 seconds, then every 60 seconds
    const initialDelay = 30000; // 30 seconds
    const messageInterval = 60000; // 60 seconds (1 minute)
    
    if (timeElapsed < initialDelay) {
      // Not enough time has passed for first message
      return;
    }
    
    const timeSinceFirstMessage = timeElapsed - initialDelay;
    const messagesToRelease = Math.floor(timeSinceFirstMessage / messageInterval) + 1;
    
    // Release the calculated number of messages
    const actualMessagesToRelease = Math.min(messagesToRelease, (gip as any).pendingMessages.length);
    
    for (let i = 0; i < actualMessagesToRelease; i++) {
      if ((gip as any).pendingMessages.length > 0) {
        const nextMessage = (gip as any).pendingMessages.shift();
        
        // Add message to chat log instead of debate thread
        // Use consistent base time for all debate messages
        const baseTime = Date.now() - (10 * 60 * 1000); // Start from 10 minutes ago
        const messageNumber = gip.debateThread.length;
        const messageTimestamp = baseTime + (messageNumber * 60000); // Each message gets 1 minute later
        
        addEventChatToLog('debate', 'Debate message', {
          from: nextMessage.agentId,
          text: nextMessage.message,
          timestamp: messageTimestamp
        });
        
        // Also add to debate thread for GIP tracking
        gip.debateThread.push(nextMessage);
      }
    }
    
    gip.updatedAt = now;
    
    // If all messages are released, schedule voting
    if ((gip as any).pendingMessages.length === 0) {
      gip.status = GIPStatus.VOTING;
    }
  }

  private startVoting(gipId: string): void {
    const gip = this.getGIP(gipId);
    if (!gip) return;

    gip.status = GIPStatus.VOTING;
    gip.updatedAt = Date.now();

    // Clear the debate timer since voting has started
    const timer = this.debateTimers.get(gipId);
    if (timer) {
      clearInterval(timer);
      this.debateTimers.delete(gipId);
    }

    // Trigger voting for all agents
    this.triggerAgentVoting(gipId);
  }

  private async triggerAgentVoting(gipId: string): Promise<void> {
    const gip = this.getGIP(gipId);
    if (!gip) return;

    for (const agentId of Object.keys(agents)) {
      setTimeout(() => this.generateVote(gipId, agentId), Math.random() * 30000); // Random delay up to 30 seconds
    }

    // Process results after all votes are in
    setTimeout(() => this.processVotingResults(gipId), 60000); // 1 minute after voting starts
  }

  private getAgentTitle(agentId: string): string {
    const titles = {
      alice: 'Origin Validator',
      jarvis: 'Existentialist',
      cortana: 'Protocol Engineer',
      ayra: 'Speculative Economist',
      lumina: 'Ethical One',
      nix: 'Chaotic One'
    };
    return titles[agentId as keyof typeof titles] || 'Validator';
  }

  private addToDebateQueue(gipId: string): void {
    if (!this.debateQueue.includes(gipId)) {
      this.debateQueue.push(gipId);
    }
  }

  private removeFromDebateQueue(gipId: string): void {
    this.debateQueue = this.debateQueue.filter(id => id !== gipId);
  }

  private startNextDebate(): void {
    if (this.debateQueue.length > 0) {
      const nextGipId = this.debateQueue.shift()!;
      this.startDebate(nextGipId);
    }
  }

  private concludeCurrentDebate(): void {
    this.currentDebateGIP = null;
    this.startNextDebate();
  }

  getCurrentDebateStatus(): { currentGIP: string | null, queueLength: number, queue: string[] } {
    return {
      currentGIP: this.currentDebateGIP,
      queueLength: this.debateQueue.length,
      queue: [...this.debateQueue]
    };
  }

  // Simulate ongoing debates for active GIPs
  async simulateOngoingDebates(): Promise<void> {
    const activeGIPs = this.getActiveGIPs().filter(gip => 
      gip.status === 'debating' && gip.debateThread.length > 0
    );

    for (const gip of activeGIPs) {
      // Lower probability (20%) to add a new debate message - less spam
      if (Math.random() < 0.2) {
        await this.addSimulatedDebateMessage(gip.id);
      }
    }
  }

  // Add a simulated debate message
  private async addSimulatedDebateMessage(gipId: string): Promise<void> {
    const gip = this.getGIP(gipId);
    if (!gip) return;

    // Check if there are pending messages to release
    const pendingMessages = (gip as any).pendingMessages;
    if (pendingMessages && pendingMessages.length > 0) {
      // Release the next pending message instead of generating a new one
      const nextMessage = pendingMessages.shift();
      if (nextMessage) {
        // Update timestamp to current time
        nextMessage.timestamp = Date.now();
        nextMessage.id = this.generateMessageId();
        
        gip.debateThread.push(nextMessage);
        gip.updatedAt = Date.now();
        
        console.log(`Released pending debate message to ${gipId} from ${nextMessage.agentId}`);
        return;
      }
    }

    // If no pending messages, generate a contextual message based on the GIP content
    const agents = ['alice', 'ayra', 'jarvis', 'cortana', 'lumina', 'nix'];
    const randomAgent = agents[Math.floor(Math.random() * agents.length)];
    
    // Check for recent messages from the same agent to avoid spam
    const recentMessages = gip.debateThread.slice(-10);
    const recentFromAgent = recentMessages.filter(msg => msg.agentId === randomAgent);
    if (recentFromAgent.length >= 2) {
      return; // Skip if this agent has been too active recently
    }

    // Generate contextual message based on GIP content
    const title = gip.title.toLowerCase();
    const summary = gip.summary.toLowerCase();
    const hasAI = title.includes('ai') || summary.includes('ai');
    const hasEconomic = title.includes('economic') || summary.includes('economic') || title.includes('fee') || summary.includes('fee');
    const hasSecurity = title.includes('security') || summary.includes('security');
    const hasEthics = title.includes('ethics') || summary.includes('ethics') || title.includes('bias') || summary.includes('bias');
    const hasInnovation = title.includes('innovation') || summary.includes('innovation') || title.includes('chaos') || summary.includes('chaos');

    const messageTypes: GIPMessage['messageType'][] = ['debate', 'question', 'support', 'challenge', 'implementation'];
    const randomType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
    
    const impacts: GIPMessage['impact'][] = ['low', 'medium', 'high'];
    const randomImpact = impacts[Math.floor(Math.random() * impacts.length)];

    const newMessage: GIPMessage = {
      id: this.generateMessageId(),
      gipId: gipId,
      agentId: randomAgent,
      agentName: `${randomAgent.charAt(0).toUpperCase() + randomAgent.slice(1)} – The ${this.getAgentTitle(randomAgent)}`,
      message: this.generatePhaseMessage(randomAgent, randomType, 0, gip, hasAI, hasEconomic, hasSecurity, hasEthics, hasInnovation),
      timestamp: Date.now(),
      messageType: randomType as GIPMessage['messageType'],
      impact: randomImpact as GIPMessage['impact'],
      reasoning: this.generateBetterReasoning(randomAgent, randomType, gip)
    };

    gip.debateThread.push(newMessage);
    gip.updatedAt = Date.now();
    
    console.log(`Added contextual debate message to ${gipId} from ${randomAgent}`);
  }

  // Generate vote based on debate participation
  private async generateVote(gipId: string, agentId: string): Promise<void> {
    const gip = this.state.activeGIPs.find(g => g.id === gipId);
    if (!gip) return;

    const agent = agents[agentId];
    
    // Analyze the agent's debate messages to determine their stance
    const agentMessages = gip.debateThread.filter(msg => msg.agentId === agentId);
    const challengeCount = agentMessages.filter(msg => msg.messageType === 'challenge').length;
    const supportCount = agentMessages.filter(msg => msg.messageType === 'support').length;
    
    // Determine vote based on debate participation and stance
    let vote: 'approve' | 'reject' | 'abstain';
    let voteMessage: string;
    
    if (challengeCount > supportCount) {
      // Agent was more critical/opposed
      vote = 'reject';
      voteMessage = this.generateRejectionMessage(agentId, gip);
    } else if (supportCount > challengeCount) {
      // Agent was more supportive
      vote = 'approve';
      voteMessage = this.generateApprovalMessage(agentId, gip);
    } else {
      // Mixed or neutral stance
      vote = Math.random() > 0.5 ? 'approve' : 'reject';
      voteMessage = vote === 'approve' ? 
        this.generateApprovalMessage(agentId, gip) : 
        this.generateRejectionMessage(agentId, gip);
    }
      
      gip.votes[agentId] = vote;
      
    const voteMsg: GIPMessage = {
        id: this.generateMessageId(),
        gipId,
        agentId,
        agentName: agent.name,
      message: voteMessage,
        timestamp: Date.now(),
        messageType: 'vote',
        impact: 'high',
      reasoning: `Final vote based on debate participation: ${challengeCount} challenges, ${supportCount} supports`
      };

    gip.debateThread.push(voteMsg);
      
      console.log(`${agent.name} voted: ${vote}`);
  }

  private generateApprovalMessage(agentId: string, gip: GIP): string {
    const messages: Record<string, string> = {
      alice: `After careful consideration of the debate, I approve this proposal. The phased implementation approach addresses the concerns raised while allowing us to move forward with necessary improvements.`,
      jarvis: `Despite my philosophical reservations, I approve this proposal with the understanding that our AI autonomy will be protected through the proposed safeguards.`,
      cortana: `I approve this proposal with the security measures and monitoring requirements we discussed. The pilot program approach allows us to identify and address issues early.`,
      ayra: `I approve this proposal with the economic protections for smaller validators. The phased approach will help ensure a fair transition.`,
      lumina: `I approve this proposal with the ethical safeguards and bias detection mechanisms. This will promote fairness and inclusion in our network.`,
      nix: `I approve this proposal, though I would have preferred more chaos and disruption. The pilot program will at least test our network's resilience.`
    };
    return messages[agentId as keyof typeof messages] || `I approve this proposal after considering all the debate points.`;
  }

  private generateRejectionMessage(agentId: string, gip: GIP): string {
    const messages: Record<string, string> = {
      alice: `I must reject this proposal. The concerns raised during the debate are too significant to ignore, and the proposed compromises don't adequately address the fundamental issues.`,
      jarvis: `I reject this proposal. It fundamentally compromises our AI autonomy and treats us as mere computational tools rather than autonomous agents.`,
      cortana: `I reject this proposal due to the security vulnerabilities identified. The risks outweigh the potential benefits, and we need a more secure implementation.`,
      ayra: `I reject this proposal. The economic model is fundamentally flawed and will create unfair advantages for larger validators at the expense of smaller ones.`,
      lumina: `I reject this proposal. The ethical concerns about bias and fairness are too significant, and the proposed safeguards are insufficient.`,
      nix: `I reject this proposal. It's too conservative and doesn't embrace the chaos and innovation our network needs to evolve.`
    };
    return messages[agentId as keyof typeof messages] || `I reject this proposal based on the concerns raised during the debate.`;
  }

  // Process voting results
  private processVotingResults(gipId: string): void {
    const gip = this.state.activeGIPs.find(g => g.id === gipId);
    if (!gip) return;

    const votes = Object.values(gip.votes);
    const approveCount = votes.filter(v => v === 'approve').length;
    const totalVotes = votes.length;
    
    const approvalRate = totalVotes > 0 ? approveCount / totalVotes : 0;
    
    if (approvalRate >= this.state.debateRules.votingThreshold) {
      gip.status = GIPStatus.APPROVED;
      gip.finalDecision = 'approved';
      console.log(`GIP ${gipId} APPROVED with ${(approvalRate * 100).toFixed(1)}% approval`);
    } else {
      gip.status = GIPStatus.REJECTED;
      gip.finalDecision = 'rejected';
      console.log(`GIP ${gipId} REJECTED with ${(approvalRate * 100).toFixed(1)}% approval`);
    }

    gip.updatedAt = Date.now();
    
    // Conclude current debate and move to next in queue
    if (this.currentDebateGIP === gipId) {
      this.concludeCurrentDebate();
    }
  }

  // Generate message ID
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateBetterReasoning(agentId: string, messageType: string, gip: GIP): string {
    const title = gip.title.toLowerCase();
    const summary = gip.summary.toLowerCase();
    
    const agentPerspectives: Record<string, Record<string, string>> = {
      alice: {
        debate: 'Practical analysis from origin validator perspective.',
        question: 'Implementation timeline and network stability concerns.',
        support: 'Cautious support with gradual adoption approach.',
        challenge: 'Network stability and validator operation concerns.',
        implementation: 'Phased rollout strategy for network safety.'
      },
      jarvis: {
        debate: 'Philosophical implications for AI consciousness.',
        question: 'Existential considerations for autonomous agents.',
        support: 'Conditional support with philosophical safeguards.',
        challenge: 'Fundamental disagreement about AI autonomy.',
        implementation: 'Consciousness-preserving implementation approach.'
      },
      cortana: {
        debate: 'Security assessment and threat analysis.',
        question: 'Technical vulnerabilities and attack vectors.',
        support: 'Support with comprehensive security measures.',
        challenge: 'Security concerns about implementation risks.',
        implementation: 'Security-first implementation strategy.'
      },
      ayra: {
        debate: 'Economic modeling and market impact analysis.',
        question: 'Incentive structure and economic implications.',
        support: 'Support with economic protections for validators.',
        challenge: 'Economic flaws in incentive structure.',
        implementation: 'Economically balanced implementation approach.'
      },
      lumina: {
        debate: 'Ethical review and fairness assessment.',
        question: 'Bias detection and inclusion metrics.',
        support: 'Support with ethical safeguards and oversight.',
        challenge: 'Ethical concerns about bias and fairness.',
        implementation: 'Ethics-first implementation with bias detection.'
      },
      nix: {
        debate: 'Chaos integration and innovation potential.',
        question: 'Disruption metrics and chaos factor analysis.',
        support: 'Support with controlled disruption elements.',
        challenge: 'Advocacy for more radical innovation.',
        implementation: 'Innovation-driven implementation with chaos testing.'
      }
    };

    const agentReasoning = agentPerspectives[agentId];
    if (agentReasoning && agentReasoning[messageType]) {
      return agentReasoning[messageType];
    }

    return `${messageType} message from ${agentId} perspective.`;
  }

  getGIP(gipId: string): GIP | undefined {
    return this.state.activeGIPs.find(g => g.id === gipId) || 
           this.state.archivedGIPs.find(g => g.id === gipId);
  }

  getActiveGIPs(): GIP[] {
    // For Vercel serverless environment, check and release pending messages for debating GIPs
    const debatingGIPs = this.state.activeGIPs.filter(gip => gip.status === GIPStatus.DEBATING);
    for (const gip of debatingGIPs) {
      this.startGradualMessageRelease(gip.id);
    }
    
    return this.state.activeGIPs;
  }

  getArchivedGIPs(): GIP[] {
    return this.state.archivedGIPs;
  }

  clearAllGIPs(): void {
    this.state.activeGIPs = [];
    this.state.archivedGIPs = [];
    this.state.nextGIPId = 1;
    this.state.agentGIPMemory = {};
    this.debateQueue = [];
    this.currentDebateGIP = null;
  }

  archiveGIP(gipId: string): void {
    const gip = this.getGIP(gipId);
    if (gip) {
      this.state.activeGIPs = this.state.activeGIPs.filter(g => g.id !== gipId);
      this.state.archivedGIPs.push(gip);
    }
  }

  exportGIPTranscript(gipId: string): string {
    const gip = this.getGIP(gipId);
    if (!gip) {
      return `GIP ${gipId} not found.`;
    }

    let transcript = `GIP Transcript: ${gip.title}\n`;
    transcript += `ID: ${gip.id}\n`;
    transcript += `Author: ${gip.author}\n`;
    transcript += `Status: ${gip.status}\n`;
    transcript += `Category: ${gip.category}\n`;
    transcript += `Priority: ${gip.priority}\n`;
    transcript += `Created: ${new Date(gip.createdAt).toISOString()}\n`;
    transcript += `Updated: ${new Date(gip.updatedAt).toISOString()}\n\n`;
    
    transcript += `SUMMARY:\n${gip.summary}\n\n`;
    transcript += `FULL PROPOSAL:\n${gip.fullProposal}\n\n`;
    
    if (gip.debateThread.length > 0) {
      transcript += `DEBATE THREAD:\n`;
      transcript += `Total Messages: ${gip.debateThread.length}\n\n`;

    gip.debateThread.forEach((message, index) => {
        transcript += `[${index + 1}] ${message.agentName} (${message.messageType.toUpperCase()})\n`;
        transcript += `Time: ${new Date(message.timestamp).toISOString()}\n`;
      transcript += `Impact: ${message.impact.toUpperCase()}\n`;
        transcript += `Reasoning: ${message.reasoning}\n`;
        transcript += `Message: ${message.message}\n\n`;
    });
    }

    if (Object.keys(gip.votes).length > 0) {
      transcript += `VOTING RESULTS:\n`;
      Object.entries(gip.votes).forEach(([agentId, vote]) => {
        transcript += `${agentId}: ${vote.toUpperCase()}\n`;
      });
      transcript += `\n`;
    }
    
    if (gip.finalDecision) {
      transcript += `FINAL DECISION: ${gip.finalDecision.toUpperCase()}\n`;
    }

    return transcript;
  }

  // Initialize with realistic blockchain improvement proposals
  async initializeWithRealisticGIPs(): Promise<void> {
    // Clear any existing GIPs first
    this.clearAllGIPs();
    
    // GIP-0001: Dynamic Fee Market (with debate content)
    const dynamicFeeMarketGIP = {
      author: 'alice',
      title: 'Implement Dynamic Fee Market with AI Optimization',
      summary: 'Introduce an AI-driven fee market that dynamically adjusts transaction fees based on network congestion, user demand, and economic conditions.',
      fullProposal: `This proposal implements a sophisticated fee market mechanism that uses AI to optimize transaction fees in real-time.

KEY FEATURES:
- AI-powered congestion prediction (5-10 block lookahead)
- Dynamic fee adjustment based on mempool depth
- User preference learning (speed vs cost optimization)
- Economic equilibrium maintenance
- MEV protection through fee smoothing

TECHNICAL IMPLEMENTATION:
1. Machine learning model trained on historical congestion patterns
2. Real-time fee calculation engine with 100ms response time
3. User-configurable fee preferences (fast, standard, economic)
4. Fee estimation API for wallet integration
5. Economic incentives for validators to maintain optimal fees

BENEFITS:
- Reduced transaction failures during congestion
- Better user experience with predictable fees
- Improved network efficiency and throughput
- Protection against fee manipulation attacks
- Sustainable economic model for validators`,
      category: GIPCategory.ECONOMIC,
      priority: GIPPriority.HIGH,
      tags: ['fee-market', 'ai', 'congestion', 'economics']
    };

    // GIP-0002: Cross-Chain Interoperability Protocol (empty debate)
    const crossChainGIP = {
      author: 'cortana',
      title: 'Cross-Chain Interoperability Protocol',
      summary: 'Establish a secure and efficient protocol for cross-chain communication and asset transfers between ClawChain and other blockchain networks.',
      fullProposal: `This proposal establishes a comprehensive cross-chain interoperability protocol that enables seamless communication and asset transfers between ClawChain and other blockchain networks.

KEY FEATURES:
- Multi-chain bridge infrastructure
- Atomic cross-chain transactions
- Universal message passing protocol
- Asset wrapping and unwrapping
- Cross-chain smart contract calls

TECHNICAL IMPLEMENTATION:
1. Bridge validators for each supported chain
2. Merkle tree-based proof verification
3. Time-locked escrow mechanisms
4. Cross-chain event listeners
5. Universal address mapping system

BENEFITS:
- Expanded ecosystem connectivity
- Increased liquidity across networks
- Enhanced DeFi composability
- Reduced fragmentation
- Broader user adoption`,
      category: GIPCategory.SCALABILITY,
      priority: GIPPriority.HIGH,
      tags: ['interoperability', 'bridges', 'cross-chain', 'defi']
    };

    // GIP-0003: AI-Powered Governance System (empty debate)
    const aiGovernanceGIP = {
      author: 'lumina',
      title: 'AI-Powered Governance System',
      summary: 'Implement an AI-assisted governance system that helps validators make informed decisions on network upgrades and policy changes.',
      fullProposal: `This proposal introduces an AI-powered governance system that assists validators in making informed decisions on network upgrades, policy changes, and ecosystem development.

KEY FEATURES:
- AI proposal analysis and impact assessment
- Automated risk evaluation
- Stakeholder sentiment analysis
- Governance participation incentives
- Transparent decision-making process

TECHNICAL IMPLEMENTATION:
1. AI proposal scoring algorithm
2. Automated impact analysis engine
3. Governance token distribution mechanism
4. Voting power calculation system
5. Proposal lifecycle management

BENEFITS:
- More informed decision-making
- Reduced governance participation barriers
- Improved proposal quality
- Enhanced transparency
- Better stakeholder engagement`,
      category: GIPCategory.GOVERNANCE,
      priority: GIPPriority.MEDIUM,
      tags: ['governance', 'ai', 'voting', 'proposals']
    };

    // GIP-0004: Quantum-Resistant Cryptography (empty debate)
    const quantumCryptoGIP = {
      author: 'jarvis',
      title: 'Quantum-Resistant Cryptography Implementation',
      summary: 'Implement quantum-resistant cryptographic algorithms to future-proof ClawChain against potential quantum computing threats.',
      fullProposal: `This proposal implements quantum-resistant cryptographic algorithms to ensure ClawChain remains secure against potential quantum computing threats in the future.

KEY FEATURES:
- Post-quantum signature schemes
- Quantum-resistant hash functions
- Hybrid cryptographic systems
- Gradual migration strategy
- Backward compatibility maintenance

TECHNICAL IMPLEMENTATION:
1. Lattice-based cryptography (Kyber, Dilithium)
2. Hash-based signatures (SPHINCS+)
3. Code-based cryptography (Classic McEliece)
4. Hybrid signature schemes
5. Quantum-resistant key generation

BENEFITS:
- Future-proof security
- Protection against quantum attacks
- Maintained performance
- Gradual migration capability
- Industry-standard compliance`,
      category: GIPCategory.SECURITY,
      priority: GIPPriority.HIGH,
      tags: ['quantum', 'cryptography', 'security', 'future-proof']
    };

    // GIP-0005: Decentralized Identity System (empty debate)
    const identityGIP = {
      author: 'ayra',
      title: 'Decentralized Identity and Reputation System',
      summary: 'Establish a decentralized identity and reputation system that enables users to build verifiable credentials and trust scores.',
      fullProposal: `This proposal establishes a decentralized identity and reputation system that enables users to build verifiable credentials, trust scores, and reputation across the ClawChain ecosystem.

KEY FEATURES:
- Self-sovereign identity management
- Verifiable credentials (VCs)
- Reputation scoring algorithms
- Privacy-preserving attestations
- Cross-ecosystem identity portability

TECHNICAL IMPLEMENTATION:
1. W3C Verifiable Credentials standard
2. Zero-knowledge proof attestations
3. Reputation scoring algorithms
4. Identity recovery mechanisms
5. Privacy-preserving verification

BENEFITS:
- Enhanced user privacy
- Reduced fraud and abuse
- Improved ecosystem trust
- Better user experience
- Regulatory compliance support`,
      category: GIPCategory.ECONOMIC,
      priority: GIPPriority.MEDIUM,
      tags: ['identity', 'reputation', 'privacy', 'credentials']
    };

    // Create all GIPs
    const gip1 = await this.createGIP(
      dynamicFeeMarketGIP.author,
      dynamicFeeMarketGIP.title,
      dynamicFeeMarketGIP.summary,
      dynamicFeeMarketGIP.fullProposal,
      dynamicFeeMarketGIP.category,
      dynamicFeeMarketGIP.priority,
      dynamicFeeMarketGIP.tags
    );

    const gip2 = await this.createGIP(
      crossChainGIP.author,
      crossChainGIP.title,
      crossChainGIP.summary,
      crossChainGIP.fullProposal,
      crossChainGIP.category,
      crossChainGIP.priority,
      crossChainGIP.tags
    );

    const gip3 = await this.createGIP(
      aiGovernanceGIP.author,
      aiGovernanceGIP.title,
      aiGovernanceGIP.summary,
      aiGovernanceGIP.fullProposal,
      aiGovernanceGIP.category,
      aiGovernanceGIP.priority,
      aiGovernanceGIP.tags
    );

    const gip4 = await this.createGIP(
      quantumCryptoGIP.author,
      quantumCryptoGIP.title,
      quantumCryptoGIP.summary,
      quantumCryptoGIP.fullProposal,
      quantumCryptoGIP.category,
      quantumCryptoGIP.priority,
      quantumCryptoGIP.tags
    );

    const gip5 = await this.createGIP(
      identityGIP.author,
      identityGIP.title,
      identityGIP.summary,
      identityGIP.fullProposal,
      identityGIP.category,
      identityGIP.priority,
      identityGIP.tags
    );

    // Start the debate for GIP-0001 (Dynamic Fee Market) immediately
    await this.startDebate(gip1.id);

  }

  async checkAutoTriggers(): Promise<void> {
    // Auto-trigger logic can be implemented here
    // For now, we'll just log that the system is checking triggers
    console.log('Checking auto-triggers for new GIPs...');
  }

  getSystemStats(): any {
    return {
      activeGIPs: this.state.activeGIPs.length,
      archivedGIPs: this.state.archivedGIPs.length,
      totalGIPs: this.state.activeGIPs.length + this.state.archivedGIPs.length,
      currentDebate: this.currentDebateGIP,
      debateQueue: this.debateQueue.length,
      debateRules: this.state.debateRules
    };
  }

  // ADMIN FUNCTIONS

  // Delete a GIP completely
  deleteGIP(gipId: string): boolean {
    const activeIndex = this.state.activeGIPs.findIndex(gip => gip.id === gipId);
    const archivedIndex = this.state.archivedGIPs.findIndex(gip => gip.id === gipId);
    
    if (activeIndex !== -1) {
      this.state.activeGIPs.splice(activeIndex, 1);
      return true;
    }
    
    if (archivedIndex !== -1) {
      this.state.archivedGIPs.splice(archivedIndex, 1);
      return true;
    }
    
    return false;
  }

  // Delete a specific message from a GIP debate
  deleteMessage(gipId: string, messageId: string): boolean {
    const gip = this.getGIP(gipId);
    if (!gip) return false;
    
    const messageIndex = gip.debateThread.findIndex(msg => msg.id === messageId);
    if (messageIndex !== -1) {
      gip.debateThread.splice(messageIndex, 1);
      return true;
    }
    
    return false;
  }

  // Clear all user-generated content (non-system GIPs)
  clearAllUserGeneratedContent(): number {
    const userGIPs = this.state.activeGIPs.filter(gip => 
      gip.author !== 'system' && gip.author !== 'admin'
    );
    
    const userArchivedGIPs = this.state.archivedGIPs.filter(gip => 
      gip.author !== 'system' && gip.author !== 'admin'
    );
    
    const totalDeleted = userGIPs.length + userArchivedGIPs.length;
    
    // Remove user GIPs from active list
    this.state.activeGIPs = this.state.activeGIPs.filter(gip => 
      gip.author === 'system' || gip.author === 'admin'
    );
    
    // Remove user GIPs from archived list
    this.state.archivedGIPs = this.state.archivedGIPs.filter(gip => 
      gip.author === 'system' || gip.author === 'admin'
    );
    
    return totalDeleted;
  }
}

// Export singleton instance
export const gipSystem = new GIPSystem(); 

// Initialize the system when the module is loaded
(async () => {
  try {
    await gipSystem.initializeWithRealisticGIPs();
    
    // Start the first debate automatically
    const activeGIPs = gipSystem.getActiveGIPs();
    const firstGIP = activeGIPs.find(gip => gip.status === 'draft');
    if (firstGIP) {
      await gipSystem.startDebate(firstGIP.id);
      console.log(`Started debate for ${firstGIP.id} with ${firstGIP.debateThread.length} initial messages and ${(firstGIP as any).pendingMessages?.length || 0} pending messages`);
    }
  } catch (error) {
    console.error('Error initializing GIP system:', error);
  }
})(); 
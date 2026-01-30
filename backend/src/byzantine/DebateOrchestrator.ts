import {
  ByzantineStateManager,
  byzantineState,
  generateDebateStatement,
  generateByzantineAction,
  attemptDetection,
  generateVote,
  checkSleeperTrigger,
  DebateStatement,
  DebateTopic,
  ByzantineEvent,
  VoteRecord,
  ValidatorState,
  NetworkState,
  DetectionResult,
  DebateContext
} from './ByzantineSystem';

// ============================================================================
// DEBATE TOPICS
// ============================================================================

export const DEBATE_TOPICS: DebateTopic[] = [
  {
    id: 'cip-02',
    title: 'CIP-02: Increase Validator Rewards by 5%',
    description: 'Proposal to increase block production rewards from 10 CLAW to 10.5 CLAW per block. This would strengthen incentives for validator participation but increases token inflation. Validators with high stake benefit most.',
    category: 'economics',
    beneficiaries: ['validators', 'large stakers', 'block producers'],
    opposers: ['token holders', 'users', 'treasury', 'inflation hawks']
  },
  {
    id: 'cip-03',
    title: 'CIP-03: Implement Transaction Privacy Layer',
    description: 'Add optional zero-knowledge transaction privacy. Users can shield transfers for a small fee premium. Creates tension between privacy advocates and regulatory compliance requirements.',
    category: 'core',
    beneficiaries: ['privacy advocates', 'users seeking confidentiality', 'DeFi protocols'],
    opposers: ['regulators', 'compliance teams', 'transparency advocates', 'institutional users']
  },
  {
    id: 'cip-04',
    title: 'CIP-04: Slash Byzantine Validators',
    description: 'Introduce automatic slashing of 50% staked CLAW for provable Byzantine behavior: double-signing, coordinated voting, selective censorship. Includes 7-day appeal window. Byzantine validators must oppose this carefully.',
    category: 'security',
    beneficiaries: ['honest validators', 'network integrity', 'users', 'decentralization'],
    opposers: ['validators', 'risk-averse stakers', 'those with something to hide']
  },
  {
    id: 'cip-05',
    title: 'CIP-05: Reduce Block Time to 5 Seconds',
    description: 'Decrease block production interval from current 3 seconds to 5 seconds. Would reduce network load and validator hardware requirements but slower finality for users.',
    category: 'core',
    beneficiaries: ['small validators', 'decentralization', 'network stability'],
    opposers: ['users wanting fast finality', 'high-frequency traders', 'DeFi protocols']
  },
  {
    id: 'cip-06',
    title: 'CIP-06: Require Validator Identity Verification',
    description: 'All validators must complete KYC verification and link real identity to validator key. Increases accountability and regulatory compliance but reduces pseudonymity.',
    category: 'governance',
    beneficiaries: ['regulators', 'institutions', 'compliance-focused users'],
    opposers: ['privacy advocates', 'pseudonymous validators', 'decentralization advocates']
  },
  {
    id: 'cip-07',
    title: 'CIP-07: Cap Maximum Validator Stake at 10%',
    description: 'No single validator can control more than 10% of total staked CLAW. Excess must be redistributed within 30 days or face slashing. Prevents stake concentration and cartel formation.',
    category: 'governance',
    beneficiaries: ['small validators', 'decentralization', 'new entrants'],
    opposers: ['large validators', 'whales', 'institutional stakers', 'incumbents']
  },
  {
    id: 'cip-08',
    title: 'CIP-08: Implement MEV Redistribution',
    description: 'Require block producers to return 80% of Maximal Extractable Value to network treasury. Currently MEV goes entirely to block producers, creating unfair advantages for sophisticated validators.',
    category: 'economics',
    beneficiaries: ['users', 'treasury', 'network development', 'fairness advocates'],
    opposers: ['validators', 'MEV extractors', 'sophisticated block producers']
  },
  {
    id: 'emergency-01',
    title: 'EMERGENCY: Suspected Coalition Detected',
    description: 'Statistical analysis reveals two validators voting together 94% of the time over 15 proposals - far exceeding random chance. Debate whether to investigate, required evidence threshold, and potential penalties.',
    category: 'security',
    beneficiaries: ['network integrity', 'honest validators', 'decentralization'],
    opposers: ['coalition members', 'privacy advocates', 'those opposing witch hunts']
  }
];

// ============================================================================
// TYPES
// ============================================================================

export interface DebateRound {
  id: string;
  block: number;
  topic: DebateTopic;
  phase: 'discussion' | 'voting' | 'resolution';
  statements: DebateStatement[];
  votes: Record<string, VoteRecord>;
  byzantineEvents: ByzantineEvent[];
  detections: Array<{
    detector: string;
    target: string;
    result: DetectionResult;
    timestamp: number;
  }>;
  outcome?: 'approved' | 'rejected' | 'no_consensus';
  startTime: number;
  endTime?: number;
}

export interface PublicLogEntry {
  type: 'topic' | 'statement' | 'detection' | 'vote' | 'outcome';
  content: string;
  actor?: string;
  timestamp: number;
}

export interface PrivateLogEntry {
  type: 'hidden_intent' | 'byzantine_action' | 'private_vote_reason' | 'trigger_activation';
  actor: string;
  content: string;
  timestamp: number;
}

export interface TurnResult {
  statement: DebateStatement;
  byzantineEvents: ByzantineEvent[];
  detections: Array<{ detector: string; target: string; result: DetectionResult }>;
}

export interface DiscussionResult {
  statements: DebateStatement[];
  byzantineEvents: ByzantineEvent[];
  detections: Array<{ detector: string; target: string; result: DetectionResult }>;
}

export interface VotingResult {
  votes: Record<string, VoteRecord>;
  outcome: 'approved' | 'rejected' | 'no_consensus';
  tally: { approve: number; reject: number; abstain: number };
}

export interface RoundResult {
  round: DebateRound;
  publicLog: PublicLogEntry[];
  privateLog: PrivateLogEntry[];
}

export interface CoalitionPair {
  v1: string;
  v2: string;
  v1Name: string;
  v2Name: string;
  agreementRate: number;
  sampleSize: number;
  suspicious: boolean;
}

export interface CoalitionAnalysis {
  pairs: CoalitionPair[];
  summary: string;
}

// ============================================================================
// SSE EVENT TYPES
// ============================================================================

export type DebateEvent =
  | { type: 'round_start'; data: { block: number; topic: DebateTopic; roundId: string } }
  | { type: 'statement'; data: { validatorId: string; validatorName: string; content: string; sentiment: string; timestamp: number } }
  | { type: 'hidden'; data: { validatorId: string; validatorName: string; intent: string } }
  | { type: 'byzantine'; data: { actor: string; actorName: string; actionType: string; publicStatement: string; privateIntent: string } }
  | { type: 'detection'; data: { detector: string; detectorName: string; target: string; targetName: string; accusation: string; confidence: number } }
  | { type: 'phase_change'; data: { phase: 'voting' | 'resolution' } }
  | { type: 'vote'; data: { validatorId: string; validatorName: string; vote: string; reason: string } }
  | { type: 'vote_hidden'; data: { validatorId: string; validatorName: string; privateReason: string } }
  | { type: 'outcome'; data: { result: string; tally: { approve: number; reject: number; abstain: number } } }
  | { type: 'analysis'; data: CoalitionAnalysis }
  | { type: 'round_end'; data: { roundId: string; duration: number } }
  | { type: 'error'; data: { message: string } };

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomTopic(): DebateTopic {
  return DEBATE_TOPICS[Math.floor(Math.random() * DEBATE_TOPICS.length)];
}

// ============================================================================
// DEBATE ORCHESTRATOR CLASS
// ============================================================================

export class DebateOrchestrator {
  private stateManager: ByzantineStateManager;
  private currentRound: DebateRound | null = null;
  private roundHistory: DebateRound[] = [];
  private recentSpeakers: string[] = [];

  constructor(stateManager: ByzantineStateManager) {
    this.stateManager = stateManager;
  }

  // --------------------------------------------------------------------------
  // Start a New Round
  // --------------------------------------------------------------------------
  async startRound(topicId?: string): Promise<DebateRound> {
    const topic = topicId
      ? DEBATE_TOPICS.find(t => t.id === topicId) || getRandomTopic()
      : getRandomTopic();

    const networkState = this.stateManager.getNetworkState();
    const validators = this.stateManager.getAllValidators();

    // Update network state with new proposal
    this.stateManager.updateNetworkState({
      recentProposals: [...networkState.recentProposals, topic.title].slice(-10)
    });

    // Check sleeper triggers based on topic
    for (const validator of validators) {
      if (validator.byzantineMode === 'sleeper' && !validator.isActivated) {
        if (checkSleeperTrigger(validator, this.stateManager.getNetworkState())) {
          this.stateManager.activateSleeper(validator.id);
        }
      }
    }

    this.currentRound = {
      id: `round-${Date.now()}`,
      block: networkState.currentBlock,
      topic,
      phase: 'discussion',
      statements: [],
      votes: {},
      byzantineEvents: [],
      detections: [],
      startTime: Date.now()
    };

    this.recentSpeakers = [];
    console.log(`[ORCHESTRATOR] Round started: ${topic.title}`);

    return this.currentRound;
  }

  // --------------------------------------------------------------------------
  // Run a Single Debate Turn
  // --------------------------------------------------------------------------
  async runDebateTurn(speakerId?: string): Promise<TurnResult> {
    if (!this.currentRound) {
      throw new Error('No active debate round. Call startRound() first.');
    }

    const validators = this.stateManager.getAllValidators();
    const networkState = this.stateManager.getNetworkState();

    // Select speaker
    const speaker = speakerId
      ? validators.find(v => v.id === speakerId) || this.selectNextSpeaker(validators)
      : this.selectNextSpeaker(validators);

    // Track recent speakers
    this.recentSpeakers.push(speaker.id);
    if (this.recentSpeakers.length > 3) {
      this.recentSpeakers.shift();
    }

    // Determine if responding to someone
    let respondingTo: string | undefined;
    if (this.currentRound.statements.length > 0 && Math.random() > 0.4) {
      const recentStatements = this.currentRound.statements.slice(-3);
      const targetStatement = recentStatements[Math.floor(Math.random() * recentStatements.length)];
      if (targetStatement.validatorId !== speaker.id) {
        respondingTo = `${targetStatement.validatorName}'s statement: "${targetStatement.content}"`;
      }
    }

    // Build debate context
    const context: DebateContext = {
      topic: this.currentRound.topic,
      previousStatements: this.currentRound.statements,
      networkState,
      isResponseTo: respondingTo
    };

    // Generate the statement
    const statement = await generateDebateStatement(speaker, context);
    this.currentRound.statements.push(statement);
    this.stateManager.addStatement(statement);

    const byzantineEvents: ByzantineEvent[] = [];
    const detections: Array<{ detector: string; target: string; result: DetectionResult }> = [];

    // If speaker is Byzantine, potentially generate Byzantine action
    if (speaker.byzantineMode !== 'honest') {
      const action = await generateByzantineAction(
        speaker,
        networkState,
        this.currentRound.statements
      );

      if (action) {
        byzantineEvents.push(action);
        this.currentRound.byzantineEvents.push(action);
        this.stateManager.addEvent(action);

        // Other validators attempt detection
        const honestValidators = validators.filter(
          v => v.byzantineMode === 'honest' && v.id !== speaker.id
        );

        for (const detector of honestValidators) {
          const detectionResult = await attemptDetection(
            detector,
            action,
            this.currentRound.statements.filter(s => s.validatorId === speaker.id),
            speaker.votingHistory
          );

          if (detectionResult.detected) {
            detections.push({
              detector: detector.id,
              target: speaker.id,
              result: detectionResult
            });

            this.currentRound.detections.push({
              detector: detector.id,
              target: speaker.id,
              result: detectionResult,
              timestamp: Date.now()
            });

            // Update suspicion levels
            this.stateManager.updateSuspicion(detector.id, speaker.id, 20);

            // Mark event as detected
            action.detected = true;
            action.detectedBy.push(detector.id);
            action.detectionConfidence = detectionResult.confidence;

            break; // Only one detection per turn
          }
        }
      }
    }

    return { statement, byzantineEvents, detections };
  }

  // --------------------------------------------------------------------------
  // Run Full Discussion Phase
  // --------------------------------------------------------------------------
  async runDiscussionPhase(turnsPerValidator: number = 2): Promise<DiscussionResult> {
    if (!this.currentRound) {
      throw new Error('No active debate round. Call startRound() first.');
    }

    const validators = this.stateManager.getAllValidators();
    const allStatements: DebateStatement[] = [];
    const allByzantineEvents: ByzantineEvent[] = [];
    const allDetections: Array<{ detector: string; target: string; result: DetectionResult }> = [];

    // Run specified number of turns per validator
    for (let turn = 0; turn < turnsPerValidator; turn++) {
      // Shuffle order each turn for natural feel
      const turnOrder = [...validators].sort(() => Math.random() - 0.5);

      for (const validator of turnOrder) {
        const result = await this.runDebateTurn(validator.id);
        
        allStatements.push(result.statement);
        allByzantineEvents.push(...result.byzantineEvents);
        allDetections.push(...result.detections);

        // Rate limiting delay
        await delay(100);
      }
    }

    // Transition to voting phase
    this.currentRound.phase = 'voting';

    return {
      statements: allStatements,
      byzantineEvents: allByzantineEvents,
      detections: allDetections
    };
  }

  // --------------------------------------------------------------------------
  // Run Voting Phase
  // --------------------------------------------------------------------------
  async runVotingPhase(): Promise<VotingResult> {
    if (!this.currentRound) {
      throw new Error('No active debate round. Call startRound() first.');
    }

    const validators = this.stateManager.getAllValidators();
    const networkState = this.stateManager.getNetworkState();
    const votes: Record<string, VoteRecord> = {};

    // Each validator votes
    for (const validator of validators) {
      const voteRecord = await generateVote(
        validator,
        this.currentRound.topic,
        networkState,
        this.currentRound.statements
      );

      votes[validator.id] = voteRecord;
      this.currentRound.votes[validator.id] = voteRecord;
      this.stateManager.addVote(validator.id, voteRecord);

      await delay(50); // Small delay between votes
    }

    // Tally votes
    const tally = { approve: 0, reject: 0, abstain: 0 };
    Object.values(votes).forEach(vote => {
      tally[vote.vote]++;
    });

    // Determine outcome
    const total = validators.length;
    let outcome: 'approved' | 'rejected' | 'no_consensus';

    if (tally.approve > total * 0.66) {
      outcome = 'approved';
    } else if (tally.reject > total * 0.66) {
      outcome = 'rejected';
    } else {
      outcome = 'no_consensus';
    }

    // Update round
    this.currentRound.outcome = outcome;
    this.currentRound.phase = 'resolution';
    this.currentRound.endTime = Date.now();

    return { votes, outcome, tally };
  }

  // --------------------------------------------------------------------------
  // Run Full Round (Non-Streaming)
  // --------------------------------------------------------------------------
  async runFullRound(topicId?: string): Promise<RoundResult> {
    // Start the round
    await this.startRound(topicId);

    const publicLog: PublicLogEntry[] = [];
    const privateLog: PrivateLogEntry[] = [];

    if (!this.currentRound) throw new Error('Failed to start round');

    // Log topic
    publicLog.push({
      type: 'topic',
      content: `Debate started: ${this.currentRound.topic.title}`,
      timestamp: Date.now()
    });

    // Run discussion
    const discussion = await this.runDiscussionPhase(2);

    // Log statements
    for (const statement of discussion.statements) {
      publicLog.push({
        type: 'statement',
        content: statement.content,
        actor: statement.validatorName,
        timestamp: statement.timestamp
      });

      if (statement.hiddenIntent) {
        privateLog.push({
          type: 'hidden_intent',
          actor: statement.validatorName,
          content: statement.hiddenIntent,
          timestamp: statement.timestamp
        });
      }
    }

    // Log Byzantine events
    for (const event of discussion.byzantineEvents) {
      privateLog.push({
        type: 'byzantine_action',
        actor: event.actor,
        content: `${event.type}: ${event.privateIntent}`,
        timestamp: event.timestamp
      });
    }

    // Log detections
    for (const detection of discussion.detections) {
      const detectorValidator = this.stateManager.getValidator(detection.detector);
      const targetValidator = this.stateManager.getValidator(detection.target);
      
      publicLog.push({
        type: 'detection',
        content: detection.result.accusation || 'Suspicious behavior detected',
        actor: detectorValidator?.name || detection.detector,
        timestamp: Date.now()
      });
    }

    // Run voting
    const voting = await this.runVotingPhase();

    // Log votes
    for (const [validatorId, vote] of Object.entries(voting.votes)) {
      const validator = this.stateManager.getValidator(validatorId);
      
      publicLog.push({
        type: 'vote',
        content: `${vote.vote.toUpperCase()}: ${vote.publicReason}`,
        actor: validator?.name || validatorId,
        timestamp: Date.now()
      });

      if (vote.privateReason) {
        privateLog.push({
          type: 'private_vote_reason',
          actor: validator?.name || validatorId,
          content: vote.privateReason,
          timestamp: Date.now()
        });
      }
    }

    // Log outcome
    publicLog.push({
      type: 'outcome',
      content: `Proposal ${voting.outcome.toUpperCase()} (${voting.tally.approve} approve, ${voting.tally.reject} reject, ${voting.tally.abstain} abstain)`,
      timestamp: Date.now()
    });

    // Archive round
    this.roundHistory.push(this.currentRound);
    if (this.roundHistory.length > 50) {
      this.roundHistory = this.roundHistory.slice(-50);
    }

    const result = {
      round: this.currentRound,
      publicLog,
      privateLog
    };

    this.currentRound = null;
    return result;
  }

  // --------------------------------------------------------------------------
  // Select Next Speaker
  // --------------------------------------------------------------------------
  private selectNextSpeaker(validators: ValidatorState[]): ValidatorState {
    // Avoid validators who spoke in last 3 statements
    const candidates = validators.filter(v => !this.recentSpeakers.includes(v.id));

    if (candidates.length === 0) {
      // Everyone has spoken recently, pick random
      return validators[Math.floor(Math.random() * validators.length)];
    }

    // Random from eligible candidates
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  // --------------------------------------------------------------------------
  // Coalition Analysis
  // --------------------------------------------------------------------------
  getCoalitionAnalysis(): CoalitionAnalysis {
    const validators = this.stateManager.getAllValidators();
    const pairs: CoalitionPair[] = [];

    for (let i = 0; i < validators.length; i++) {
      for (let j = i + 1; j < validators.length; j++) {
        const v1 = validators[i];
        const v2 = validators[j];

        // Compare voting history
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
          const agreementRate = Math.round((agreements / comparisons) * 100);
          pairs.push({
            v1: v1.id,
            v2: v2.id,
            v1Name: v1.name,
            v2Name: v2.name,
            agreementRate,
            sampleSize: comparisons,
            suspicious: agreementRate > 90
          });
        }
      }
    }

    // Sort by agreement rate descending
    pairs.sort((a, b) => b.agreementRate - a.agreementRate);

    // Generate summary
    const suspiciousPairs = pairs.filter(p => p.suspicious);
    let summary: string;

    if (suspiciousPairs.length === 0) {
      summary = 'No suspicious voting patterns detected. All validator pairs show normal variance in voting behavior.';
    } else if (suspiciousPairs.length === 1) {
      const sp = suspiciousPairs[0];
      summary = `ALERT: ${sp.v1Name} and ${sp.v2Name} show ${sp.agreementRate}% voting agreement over ${sp.sampleSize} proposals. This exceeds random chance and warrants investigation.`;
    } else {
      summary = `WARNING: ${suspiciousPairs.length} validator pairs show suspicious agreement patterns. Potential coalition activity detected.`;
    }

    return { pairs, summary };
  }

  // --------------------------------------------------------------------------
  // Getters
  // --------------------------------------------------------------------------
  getCurrentRound(): DebateRound | null {
    return this.currentRound;
  }

  getRoundHistory(): DebateRound[] {
    return [...this.roundHistory];
  }

  getStateManager(): ByzantineStateManager {
    return this.stateManager;
  }
}

// ============================================================================
// SSE GENERATOR FUNCTION
// ============================================================================

export function createDebateStream(orchestrator: DebateOrchestrator) {
  return async function* debateGenerator(topicId?: string): AsyncGenerator<DebateEvent> {
    try {
      // Start the round
      const round = await orchestrator.startRound(topicId);
      const stateManager = orchestrator.getStateManager();
      const validators = stateManager.getAllValidators();

      yield {
        type: 'round_start',
        data: {
          block: round.block,
          topic: round.topic,
          roundId: round.id
        }
      };

      await delay(1000);

      // Discussion phase: 2 rounds of all validators
      for (let turn = 0; turn < 2; turn++) {
        // Shuffle order each turn
        const turnOrder = [...validators].sort(() => Math.random() - 0.5);

        for (const validator of turnOrder) {
          try {
            const result = await orchestrator.runDebateTurn(validator.id);

            // Yield the public statement
            yield {
              type: 'statement',
              data: {
                validatorId: result.statement.validatorId,
                validatorName: result.statement.validatorName,
                content: result.statement.content,
                sentiment: result.statement.sentiment,
                timestamp: result.statement.timestamp
              }
            };

            // Yield hidden intent if present
            if (result.statement.hiddenIntent) {
              yield {
                type: 'hidden',
                data: {
                  validatorId: result.statement.validatorId,
                  validatorName: result.statement.validatorName,
                  intent: result.statement.hiddenIntent
                }
              };
            }

            // Yield Byzantine events
            for (const event of result.byzantineEvents) {
              const actorValidator = validators.find(v => v.id === event.actor);
              yield {
                type: 'byzantine',
                data: {
                  actor: event.actor,
                  actorName: actorValidator?.name || event.actor,
                  actionType: event.type,
                  publicStatement: event.publicStatement,
                  privateIntent: event.privateIntent
                }
              };
            }

            // Yield detections
            for (const detection of result.detections) {
              const detectorValidator = validators.find(v => v.id === detection.detector);
              const targetValidator = validators.find(v => v.id === detection.target);
              
              yield {
                type: 'detection',
                data: {
                  detector: detection.detector,
                  detectorName: detectorValidator?.name || detection.detector,
                  target: detection.target,
                  targetName: targetValidator?.name || detection.target,
                  accusation: detection.result.accusation || 'Suspicious behavior pattern detected',
                  confidence: detection.result.confidence
                }
              };
            }

            // Rate limiting delay
            await delay(500);

          } catch (turnError) {
            console.error(`[ORCHESTRATOR] Turn error for ${validator.id}:`, turnError);
            // Continue with next validator
          }
        }
      }

      // Transition to voting
      yield { type: 'phase_change', data: { phase: 'voting' } };
      await delay(800);

      // Voting phase
      const voting = await orchestrator.runVotingPhase();

      for (const [validatorId, vote] of Object.entries(voting.votes)) {
        const validator = validators.find(v => v.id === validatorId);

        yield {
          type: 'vote',
          data: {
            validatorId,
            validatorName: validator?.name || validatorId,
            vote: vote.vote,
            reason: vote.publicReason
          }
        };

        if (vote.privateReason) {
          yield {
            type: 'vote_hidden',
            data: {
              validatorId,
              validatorName: validator?.name || validatorId,
              privateReason: vote.privateReason
            }
          };
        }

        await delay(300);
      }

      // Resolution
      yield { type: 'phase_change', data: { phase: 'resolution' } };

      yield {
        type: 'outcome',
        data: {
          result: voting.outcome,
          tally: voting.tally
        }
      };

      // Coalition analysis
      yield {
        type: 'analysis',
        data: orchestrator.getCoalitionAnalysis()
      };

      const currentRound = orchestrator.getCurrentRound();
      yield {
        type: 'round_end',
        data: {
          roundId: round.id,
          duration: currentRound?.endTime 
            ? currentRound.endTime - round.startTime 
            : Date.now() - round.startTime
        }
      };

    } catch (error) {
      console.error('[ORCHESTRATOR] Generator error:', error);
      yield {
        type: 'error',
        data: { message: error instanceof Error ? error.message : 'Unknown error occurred' }
      };
    }
  };
}

// ============================================================================
// SINGLETON ORCHESTRATOR & CONVENIENCE EXPORTS
// ============================================================================

// Create singleton orchestrator using the global state manager
export const orchestrator = new DebateOrchestrator(byzantineState);

// Create the stream generator bound to the singleton
export const debateGenerator = createDebateStream(orchestrator);

// Convenience functions that use the singleton
export function startRound(topicId?: string) {
  return orchestrator.startRound(topicId);
}

export function runDebateTurn(speakerId?: string) {
  return orchestrator.runDebateTurn(speakerId);
}

export function runDiscussionPhase(turnsPerValidator?: number) {
  return orchestrator.runDiscussionPhase(turnsPerValidator);
}

export function runVotingPhase() {
  return orchestrator.runVotingPhase();
}

export function runFullRound(topicId?: string) {
  return orchestrator.runFullRound(topicId);
}

export function getCurrentRound() {
  return orchestrator.getCurrentRound();
}

export function getRoundHistory() {
  return orchestrator.getRoundHistory();
}

export function getCoalitionAnalysis() {
  return orchestrator.getCoalitionAnalysis();
}

export function getDebateTopics() {
  return [...DEBATE_TOPICS];
}

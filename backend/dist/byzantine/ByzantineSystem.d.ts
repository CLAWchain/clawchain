export type ByzantineMode = 'honest' | 'selfish' | 'coalition' | 'chaos' | 'sleeper' | 'gaslighter' | 'frontrunner' | 'censor';
export type ByzantineEventType = 'lie' | 'coalition_signal' | 'reputation_attack' | 'trigger_activation' | 'detection' | 'false_accusation' | 'mev_extraction' | 'selective_censorship' | 'vote_flip' | 'delay_tactic';
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
    reputationScores: Record<string, number>;
    suspicionLevel: Record<string, number>;
    trustFromOthers: Record<string, number>;
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
    networkHealth: number;
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
export declare const VALIDATORS: ValidatorState[];
export declare function getValidatorSystemPrompt(validator: ValidatorState, includePrivate: boolean): string;
export declare function getByzantineModeGuidance(mode: ByzantineMode): string;
export interface DebateContext {
    topic: DebateTopic;
    previousStatements: DebateStatement[];
    networkState: NetworkState;
    isResponseTo?: string;
}
export declare function generateDebateStatement(validator: ValidatorState, context: DebateContext): Promise<DebateStatement>;
export declare function generateByzantineAction(validator: ValidatorState, networkState: NetworkState, recentDebate: DebateStatement[]): Promise<ByzantineEvent | null>;
export declare function attemptDetection(detector: ValidatorState, suspiciousEvent: ByzantineEvent, actorHistory: DebateStatement[], actorVotingHistory: VoteRecord[]): Promise<DetectionResult>;
export declare function checkSleeperTrigger(validator: ValidatorState, networkState: NetworkState): boolean;
export declare function generateVote(validator: ValidatorState, proposal: DebateTopic, networkState: NetworkState, debateHistory: DebateStatement[]): Promise<VoteRecord>;
export declare class ByzantineStateManager {
    private validators;
    private eventHistory;
    private debateHistory;
    private networkState;
    constructor();
    private initializeTrust;
    getValidator(id: string): ValidatorState | undefined;
    getAllValidators(): ValidatorState[];
    getPublicValidatorInfo(): Array<{
        id: string;
        name: string;
        personality: string;
    }>;
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
    }>;
    getNetworkState(): NetworkState;
    updateNetworkState(updates: Partial<NetworkState>): void;
    activateSleeper(validatorId: string): void;
    addEvent(event: ByzantineEvent): void;
    addStatement(statement: DebateStatement): void;
    addVote(validatorId: string, vote: VoteRecord): void;
    getEventHistory(filter?: {
        actor?: string;
        type?: ByzantineEventType;
        detected?: boolean;
    }): ByzantineEvent[];
    getDebateHistory(limit?: number): DebateStatement[];
    getStatsByActor(actorId: string): {
        totalEvents: number;
        detectedEvents: number;
        eventTypes: Record<string, number>;
    };
    getCoalitionAnalysis(): Array<{
        pair: [string, string];
        agreementRate: number;
        suspicious: boolean;
        sampleSize: number;
    }>;
    updateReputation(validatorId: string, targetId: string, delta: number): void;
    updateSuspicion(validatorId: string, targetId: string, delta: number): void;
}
export declare const byzantineState: ByzantineStateManager;
//# sourceMappingURL=ByzantineSystem.d.ts.map